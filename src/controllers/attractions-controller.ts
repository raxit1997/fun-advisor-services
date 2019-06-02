import { Controller, Get, Req, Res, Body, Post } from 'routing-controllers';
import { Service, Inject } from 'typedi';
import { ResponseUtility } from '../utils/response-utility';
import { GoogleMapsAPI, ElasticSearch } from '../services/di.config';
import { Shop } from '../models/Shops/Shop';
import { Config } from '../config/Config';
import { ElasticSearchQueryBuilder, QueryProperties } from '../utils/elastic-search-query-builder';
import { Attraction } from '../models/Attractions/Attraction';

@Service()
@Controller()
export class AttractionsController {

    responseUtility: ResponseUtility;

    constructor(@Inject('google.maps.api') private googleMapsAPI: GoogleMapsAPI,
        @Inject('elastic.search') private elasticSearch: ElasticSearch) {
        this.responseUtility = new ResponseUtility();
    }

    @Post('/nearByAttractions')
    async nearByAttractions(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let latitude = req.body.latitude;
            let longitude = req.body.longitude;
            let queryString = 'popular+places';
            let placeId = req.body.placeId;
            let mode = req.body.mode;
            let requestURL = `https://maps.googleapis.com/maps/api/place/textsearch/json?key=${Config.GOOGLE_PLACES_KEY}&query=${queryString}&location=${latitude},${longitude}`;
            let response: any = await this.googleMapsAPI.fetchData(requestURL);
            response = this.sortLocations(response, latitude, longitude, placeId);
            // let matrix = await this.getDistanceMatrix(placeId, response[0].name, response[1].name, response[2].name, response[3].name, response[4].name);
            let matrix = await this.getDistanceMatrix(placeId, response[0].geometry.location.lat, response[0].geometry.location.lng, response[1].geometry.location.lat, response[1].geometry.location.lng, response[2].geometry.location.lat, response[2].geometry.location.lng, mode)
            return this.responseUtility.generateResponse(true, { matrix: matrix });
        } catch (err) {
            return { isSuccess: false };
        }

    }


    async getDistanceMatrix(placeID: string, lat1: number, lng1: number, lat2: number, lng2: number, lat3: number, lng3: number, mode: string) {

        let requestURL = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&destinations=${lat1},${lng1}|${lat2},${lng2}|${lat3},${lng3}&origins=place_id:${placeID}|${lat1},${lng1}|${lat2},${lng2}|${lat3},${lng3}&key=AIzaSyDy_MdEZwBMFtFoVj-SGakLalcEzU-oGlw&mode=${mode}`;
        let response: any = await this.googleMapsAPI.fetchData(requestURL);
        return response;
    }

    sortLocations(response: any, lat: number, lng: number, placeID: string) {
        try {
            let candidates = response.results;
            let attractions: Attraction[] = [];

            candidates.forEach((candidate: any) => {
                candidate.distance = this.getDistanceBetweenLocations(candidate.geometry.location.lat, candidate.geometry.location.lng, lat, lng);
                if (candidate.placeId !== placeID) {
                    attractions.push(candidate);
                }
            });

            attractions = attractions.sort((a: any, b: any) => {
                return a.distance > b.distance ? 1 : -1;
            });
            return attractions;
        } catch (err) {

        }

    }

    deg2Rad(distance: number) {
        return distance * Math.PI / 180;
    }

    getDistanceBetweenLocations(lat1: number, lng1: number, lat2: number, lng2: number): number {
        var deg2Rad = (deg: any) => {
            return deg * Math.PI / 180;
        }
        var r = 3956; // Radius of the earth in miles
        var dLat = this.deg2Rad(lat2 - lat1);
        var dLon = this.deg2Rad(lng2 - lng1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2Rad(lat1)) * Math.cos(this.deg2Rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = r * c; // Distance in miles
        return d;
    }




    @Get('/attractionResults/:text')
    async searchShops(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let latitude = req.headers.latitude;
            let longitude = req.headers.longitude;
            let queryString = req.params.text;
            let requestURL = `https://maps.googleapis.com/maps/api/place/textsearch/json?key=${Config.GOOGLE_PLACES_KEY}&query=${queryString}&location=${latitude},${longitude}`;
            if (req.headers.nextpagetoken) {
                requestURL = `${requestURL}&pagetoken=${req.headers.nextpagetoken}`;
            }
            let response: any = await this.googleMapsAPI.fetchData(requestURL);
            let token = response.next_page_token;
            let result = await this.retrieveResults(response);
            return this.responseUtility.generateResponse(true, { results: result, token: token });
        } catch (err) {
            return { isSuccess: false };
        }

    }


    private async retrieveResults(response: any) {
        let results: Shop[] = new Array<Attraction>();
        let places: Array<string> = new Array<string>();
        let candidates = response.results;
        let elasticSearchQueryBuilder: ElasticSearchQueryBuilder = new ElasticSearchQueryBuilder();
        candidates.forEach((candidate: any) => {
            places.push(candidate.place_id);
        });
        elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { terms: { placeID: places } });
        let placesResponse: Array<any> = await this.elasticSearch.fetchDataByQuery(elasticSearchQueryBuilder.query, Config.PLACES_TABLE.INDEX, Config.PLACES_TABLE.MAPPING);
        candidates.forEach((candidate: any) => {
            let attraction = new Attraction();
            attraction.name = candidate.name;
            attraction.address = candidate.formatted_address;
            attraction.openNow = candidate.opening_hours ? candidate.opening_hours.open_now : '-';
            attraction.placeId = candidate.place_id;
            attraction.rating = candidate.rating;
            attraction.types = candidate.types;
            attraction.latitude = candidate.geometry.location.lat;
            attraction.longitude = candidate.geometry.location.lng;
            attraction.ratingCount = candidate.user_ratings_total;
            for (let index = 0; index < placesResponse.length; index++) {
                if (placesResponse[index]._id === candidate.place_id) {
                    attraction.rating = placesResponse[index]._source.averageRating === 0 ? placesResponse[index]._source.averageRating : placesResponse[index]._source.averageRating.toFixed(1);
                    attraction.ratingCount = placesResponse[index]._source.ratingCount;
                    break;
                }
            }
            if (candidate.photos && candidate.photos.length > 0) {
                attraction.photoReference = candidate.photos[0].photo_reference;
                attraction.imageLink = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${attraction.photoReference}&key=AIzaSyCCGb_0fod9vxW27A5iuYwNbW_x2JiCAvc`;
            }
            results.push(attraction);
        });

        return results;

    }

}
