import { Controller, Get, Post, Req, Res, Body } from 'routing-controllers';
import { Service, Inject } from 'typedi';
import { ZomatoAPI } from '../services/zomato-api';
import * as express from 'express';
import { GetRestaurantsRequest } from '../models/zomato/GetRestaurantsRequest';
import { GetCityIDRequest } from '../models/zomato/GetCityIDRequest';
import { ResponseUtility } from '../utils/response-utility';

@Service()
@Controller()
export class FoodController {

    responseUtility: ResponseUtility;

    constructor(@Inject('zomato.api') private zomatoAPI: ZomatoAPI) {
        this.responseUtility = new ResponseUtility();
    }

    @Post('/getRestaurants')
    async getPlaces(@Req() req: express.Request, @Res() res: express.Response, @Body() body: GetRestaurantsRequest): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`https://developers.zomato.com/api/v2.1/search?
                count=50&lat=${body.latitude}&lon=${body.longitude}&cuisines=${body.cuisineID}&order=${body.order ? body.order : 'asc'}
                &sort=${body.sortBy}&start=${body.start}`);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return { isSuccess: false };
        }
    }

    @Post('/getCityID')
    async getCityID(@Req() req: any, @Res() res: any, @Body() body: GetCityIDRequest): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`https://developers.zomato.com/api/v2.1/cities?
                lat=${body.latitude}&lon=${body.longitude}&q=${body.cityName}`);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return { isSuccess: false };
        }
    }


    @Post('/getEstablishments')
    async getEstablishments(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`https://developers.zomato.com/api/v2.1/establishments?
                lat=${body.latitude}&lon=${body.longitude}&q=${body.cityID}`);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return { isSuccess: false };
        }
    }

    @Post('/getCuisines')
    async getCuisines(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`https://developers.zomato.com/api/v2.1/cuisines?
                lat=${body.latitude}&lon=${body.longitude}&q=${body.cityID}`);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return { isSuccess: false };
        }
    }

    @Post('/getReviews')
    async getReviews(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response: any = await this.zomatoAPI.fetchData(`https://developers.zomato.com/api/v2.1/cities?
                lat=${body.latitude}&lon=${body.longitude}&q=${body.cityName}`);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return { isSuccess: false };
        }
    }
}
