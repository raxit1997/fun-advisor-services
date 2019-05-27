import { Controller, Get, Post, Req, Res, Body } from 'routing-controllers';
import { Service, Inject } from 'typedi';
import { ZomatoAPI } from '../services/zomato-api';
import * as express from 'express';
import { GetRestaurantsRequest } from '../models/zomato/GetRestaurantsRequest';
import { GetCityIDRequest } from '../models/zomato/GetCityIDRequest';
import { ResponseUtility } from '../utils/response-utility';
import { Config } from '../config/config';

@Service()
@Controller()
export class FoodController {

    responseUtility: ResponseUtility;

    constructor(@Inject('zomato.api') private zomatoAPI: ZomatoAPI) {
        this.responseUtility = new ResponseUtility();
    }

    /**
     * @function getRestaurants Fetches the list of restaurants
     */
    @Post('/getRestaurants')
    async getRestaurants(@Req() req: express.Request, @Res() res: express.Response, @Body() body: GetRestaurantsRequest): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`${Config.ZOMATO_BASE_URL}/search?
                count=50&lat=${body.latitude}&lon=${body.longitude}&cuisines=${body.cuisineID}&order=${body.order ? body.order : 'asc'}
                &sort=${body.sortBy}&start=${body.start}`);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return this.responseUtility.generateResponse(false, error);
        }
    }

    @Post('/getCityID')
    async getCityID(@Req() req: any, @Res() res: any, @Body() body: GetCityIDRequest): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`${Config.ZOMATO_BASE_URL}/cities?
                lat=${body.latitude}&lon=${body.longitude}&q=${body.cityName}`);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return this.responseUtility.generateResponse(false, error);
        }
    }


    @Post('/getEstablishments')
    async getEstablishments(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`${Config.ZOMATO_BASE_URL}/establishments?
                lat=${body.latitude}&lon=${body.longitude}&q=${body.cityID}`);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return this.responseUtility.generateResponse(false, error);
        }
    }

    @Post('/getCuisines')
    async getCuisines(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`${Config.ZOMATO_BASE_URL}/cuisines?
                lat=${body.latitude}&lon=${body.longitude}&q=${body.cityID}`);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return this.responseUtility.generateResponse(false, error);
        }
    }

    @Post('/getReviews')
    async getReviews(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`${Config.ZOMATO_BASE_URL}/reviews?
                res_id=${body.res_id}`);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return this.responseUtility.generateResponse(false, error);
        }
    }

    @Post('/getCategories')
    async getCategories(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`${Config.ZOMATO_BASE_URL}/categories`);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return this.responseUtility.generateResponse(false, error);
        }
    }

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
}
