import { Controller, Get, Post, Req, Res, Body } from 'routing-controllers';
import { Service, Inject } from 'typedi';
import { ZomatoAPI } from '../services/zomato-api';
import * as express from 'express';
import { GetRestaurantsRequest } from '../models/zomato/GetRestaurantsRequest';
import { GetCityIDRequest } from '../models/zomato/GetCityIDRequest';
import { ResponseUtility } from '../utils/response-utility';
import { Config } from '../config/config';
import { FoodService } from '../services/food-service';
import { ElasticSearchQueryBuilder, QueryProperties } from '../utils/elastic-search-query-builder';
import { ElasticSearch } from '../services/di.config';
import { RecommenderPlace } from '../models/user/RecommenderPlace';
import { Places } from '../models/user/ESMapping';
import { RecommenderAPI } from '../services/di.config';

@Service()
@Controller()
export class FoodController {

    responseUtility: ResponseUtility;

    constructor(@Inject('zomato.api') private zomatoAPI: ZomatoAPI, @Inject('food.service') private foodService: FoodService,
        @Inject('elastic.search') private elasticSearch: ElasticSearch, @Inject("recommender.api") private recommenderAPI: RecommenderAPI) {
        this.responseUtility = new ResponseUtility();
    }

    /**
     * @function getRestaurants Fetches the list of restaurants
     */
    @Post('/getRestaurants')
    async getRestaurants(@Req() req: express.Request, @Res() res: express.Response, @Body() body: GetRestaurantsRequest): Promise<any> {
        try {
            let requestURL: string = `${Config.ZOMATO_BASE_URL}/search?lat=${body.latitude}&lon=${body.longitude}&order=${body.order ? body.order : 'desc'}&sort=${body.sortBy}&start=${body.start}`;
            let places: Array<string> = new Array<string>();
            if (body.cuisineIDs) {
                requestURL += `&cuisines=${body.cuisineIDs}`;
            }
            if (body.establishmentID) {
                requestURL += `&establishment_type=${body.establishmentID}`;
            }
            if (body.categoryIDs) {
                requestURL += `&category=${body.categoryIDs}`;
            }
            if (body.collectionID) {
                requestURL += `&collection_id=${body.collectionID}`;
            }
            // Search query
            if (body.searchQuery) {
                requestURL += `&q=${body.searchQuery}`;
            }
            let recommenderPlaces: Array<RecommenderPlace> = [];
            let zomatoAPIResponse: any = await this.zomatoAPI.fetchData(requestURL);
            let elasticSearchQueryBuilder: ElasticSearchQueryBuilder = new ElasticSearchQueryBuilder();
            if (Array.isArray(body.userID)) {
                elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { terms: { userID: body.userID } });
            } else {
                elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { userID: body.userID } });
            }
            let responses: any = await Promise.all([
                this.foodService.fetchRestaurantResponse(zomatoAPIResponse),
                this.elasticSearch.fetchDataByQuery(elasticSearchQueryBuilder.query, Config.USER_PLACES_TABLE.INDEX, Config.USER_PLACES_TABLE.MAPPING)
            ]);
            let placesCategories: any = {};
            let userPlacesResponse: Array<any> = responses[1];
            userPlacesResponse.forEach((userPlace: any) => {
                if (userPlace._source.categoryName === 'FOOD' && userPlace._source.placeID) {
                    places.push(userPlace._source.placeID);
                    placesCategories[userPlace._source.placeID] = userPlace._source.subCategories.join(', ');
                }
            });
            elasticSearchQueryBuilder = new ElasticSearchQueryBuilder();
            elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { terms: { placeID: places } });
            let placesResponseFromES: Array<any> = await this.elasticSearch.fetchDataByQuery(elasticSearchQueryBuilder.query, Config.PLACES_TABLE.INDEX, Config.PLACES_TABLE.MAPPING);
            placesResponseFromES.forEach((placeResponse: any) => {
                let pushPlace: boolean = true;
                zomatoAPIResponse.restaurants.forEach((zomatoRestaurantResponse: any) => {
                    if (zomatoRestaurantResponse.restaurant.id === placeResponse._source.placeID) {
                        pushPlace = false;
                    }
                });
                if (pushPlace) {
                    let recommenderPlace: RecommenderPlace = new RecommenderPlace();
                    recommenderPlace.rating = placeResponse._source.averageRating;
                    recommenderPlace.votes = placeResponse._source.ratingCount;
                    recommenderPlace.restaurantID = placeResponse._source.placeID;
                    recommenderPlace.cuisines = placesCategories[recommenderPlace.restaurantID];
                    recommenderPlaces.push(recommenderPlace);
                    responses[0].push(recommenderPlace);
                }
            });
            let result: Array<any>;
            if (recommenderPlaces.length != 0) {
                result = await this.recommenderAPI.setDataForRecommender(responses[0], recommenderPlaces);
                result.forEach((res: any) => {
                    recommenderPlaces.forEach((recommenderPlace: RecommenderPlace, index: number) => {
                        if (res.restaurantID === recommenderPlace.restaurantID) {
                            result.splice(index, 1)
                        }
                    });
                });
                if(body.budget && result) {
                    let restaurants = new Array<any>();
                    for(let i = 0; i < result.length; i++) {
                        let res = result[i];
                        if(res && res.cost <= body.budget && res.restaurantName) {
                           restaurants.push(res);
                        }
                    }
                    return this.responseUtility.generateResponse(true, restaurants);
                } else {
                    let restaurants = new Array<any>();
                    for(let i = 0; i < result.length; i++) {
                        let res = result[i];
                        if(res && res.restaurantName) {
                           restaurants.push(res);
                        }
                    }
                    return this.responseUtility.generateResponse(true, restaurants);
                }
            } else {
                return this.responseUtility.generateResponse(true, responses[0]);
            }
        } catch (error) {
            return this.responseUtility.generateResponse(false, error);
        }
    }

    @Post('/getCityID')
    async getCityID(@Req() req: any, @Res() res: any, @Body() body: GetCityIDRequest): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`${Config.ZOMATO_BASE_URL}/cities?lat=${body.latitude}&lon=${body.longitude}`);
            let city = this.foodService.fetchCity(response);
            return this.responseUtility.generateResponse(true, city);
        } catch (error) {
            return this.responseUtility.generateResponse(false, error);
        }
    }


    @Post('/getEstablishments')
    async getEstablishments(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`${Config.ZOMATO_BASE_URL}/establishments?lat=${body.latitude}&lon=${body.longitude}&city_id=${body.cityID}`);
            let result = this.foodService.fetchEstablishments(response);
            return this.responseUtility.generateResponse(true, result);
        } catch (error) {
            return this.responseUtility.generateResponse(false, error);
        }
    }

    @Post('/getCuisines')
    async getCuisines(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`${Config.ZOMATO_BASE_URL}/cuisines?lat=${body.latitude}&lon=${body.longitude}&city_id=${body.cityID}`);
            let result = this.foodService.fetchCuisines(response);
            return this.responseUtility.generateResponse(true, result);
        } catch (error) {
            return this.responseUtility.generateResponse(false, error);
        }
    }

    // Used for details view, given the restaurant ID
    @Post('/getReviews')
    async getReviews(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`${Config.ZOMATO_BASE_URL}/reviews?res_id=${body.res_id}`);
            let reviews = this.foodService.fetchReviews(response);
            return this.responseUtility.generateResponse(true, reviews);
        } catch (error) {
            return this.responseUtility.generateResponse(false, error);
        }
    }

    @Post('/getCategories')
    async getCategories(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`${Config.ZOMATO_BASE_URL}/categories`);
            let result = this.foodService.fetchCategories(response);
            return this.responseUtility.generateResponse(true, result);
        } catch (error) {
            return this.responseUtility.generateResponse(false, error);
        }
    }

    // For location details
    @Post('/getLocation')
    async getLocation(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`${Config.ZOMATO_BASE_URL}/locations?
                query=${body.query}`);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return this.responseUtility.generateResponse(false, error);
        }
    }

    @Post('/getLocationDetails')
    async getLocationDetails(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`${Config.ZOMATO_BASE_URL}/location_details?
                entity_id=${body.entityID}&entity_type=${body.entityType}`);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return this.responseUtility.generateResponse(false, error);
        }
    }

    @Post('/getCollections')
    async getCollection(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`${Config.ZOMATO_BASE_URL}/collections?
                lat=${body.latitude}&lon=${body.longitude}&city_id=${body.cityID}`);
            let result = this.foodService.fetchCollections(response);
            return this.responseUtility.generateResponse(true, result);
        } catch (error) {
            return this.responseUtility.generateResponse(false, error);
        }
    }
}
