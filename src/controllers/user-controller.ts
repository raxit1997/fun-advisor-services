import * as express from 'express';
import { Body, Controller, Get, Post, Put, Req, Res } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import winston = require('winston');

import { UserDelegate } from '../delegates/user-delegate';
import { LoginUserRequest } from '../models/user/LoginUserRequest';
import { UserPlacesRequest } from '../models/user/UserPlacesRequest';
import { UserRegisterRequest } from '../models/user/UserRegisterRequest';
import { ElasticSearch, WatsonAPI } from '../services/di.config';
import { ResponseUtility } from '../utils/response-utility';

@Service()
@Controller()
export class UserController {

    userDelegate: UserDelegate;
    responseUtility: ResponseUtility;

    constructor(@Inject('elastic.search') private elasticSearch: ElasticSearch,
        @Inject('watson.api') private watsonAPI: WatsonAPI) {
        this.userDelegate = new UserDelegate(elasticSearch, watsonAPI);
        this.responseUtility = new ResponseUtility();
    }

    @Post('/register-user')
    async registerUser(@Req() req: any, @Res() res: any, @Body() body: UserRegisterRequest): Promise<any> {
        try {
            let response = await this.userDelegate.registerUser(body);
            return this.responseUtility.generateResponse(true, { isUserRegistered: response });
        } catch (error) {
            winston.error(JSON.stringify(error));
            return this.responseUtility.generateResponse(false, error);
        }
    }

    @Post('/login')
    async userLogin(@Req() req: any, @Res() res: any, @Body() body: LoginUserRequest): Promise<any> {
        try {
            let response = await this.userDelegate.loginUser(body);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            winston.error(JSON.stringify(error));
            return this.responseUtility.generateResponse(false, error);
        }
    }

    @Get('/user/:userID')
    async geUserDetails(@Req() req: express.Request, @Res() res: any): Promise<any> {
        try {
            let response = await this.userDelegate.getUserDetails(req.params.userID);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            winston.error(JSON.stringify(error));
            return this.responseUtility.generateResponse(false, error);
        }
    }

    // @Put('/searched-place')
    // async searchedPlace(@Req() req: any, @Res() res: any, @Body() body: UserPlacesRequest): Promise<any> {
    //     try {
    //         let response = await this.userDelegate.searchedPlace(body);
    //         return this.responseUtility.generateResponse(true, response);
    //     } catch (error) {
    //         winston.error(JSON.stringify(error));
    //         return this.responseUtility.generateResponse(false, error);
    //     }
    // }

    @Put('/visited-place')
    async visitedPlace(@Req() req: any, @Res() res: any, @Body() body: UserPlacesRequest): Promise<any> {
        try {
            let response = await this.userDelegate.visitedPlace(body);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            winston.error(JSON.stringify(error));
            return this.responseUtility.generateResponse(false, error);
        }
    }

    @Put('/rated-place')
    async ratedPlace(@Req() req: any, @Res() res: any, @Body() body: UserPlacesRequest): Promise<any> {
        try {
            let response = await this.userDelegate.ratedPlace(body);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            winston.error(JSON.stringify(error));
            return this.responseUtility.generateResponse(false, error);
        }
    }

    @Put('/add-reviews')
    async addReviews(@Req() req: any, @Res() res: any, @Body() body: UserPlacesRequest): Promise<any> {
        try {
            let response = await this.userDelegate.addReviews(body);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            winston.error(JSON.stringify(error));
            return this.responseUtility.generateResponse(false, error);
        }
    }

    @Post('/place-overview')
    async getPlaceOverview(@Req() req: express.Request, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response = await this.userDelegate.getPlaceOverview(body);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            winston.error(JSON.stringify(error));
            return this.responseUtility.generateResponse(false, error);
        }
    }
}
