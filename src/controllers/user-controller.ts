import { Body, Controller, Post, Req, Res, Get } from 'routing-controllers';
import { Service, Inject } from 'typedi';
import winston = require('winston');
import * as express from 'express';
import { ElasticSearch } from '../services/di.config';
import { UserDelegate } from '../delegates/user-delegate';
import { ResponseUtility } from '../utils/response-utility';

@Service()
@Controller()
export class UserController {

    userDelegate: UserDelegate;
    responseUtility: ResponseUtility;

    constructor(@Inject('elastic.search') private elasticSearch: ElasticSearch) {
        this.userDelegate = new UserDelegate(elasticSearch);
        this.responseUtility = new ResponseUtility();
    }

    @Post('/register-user')
    async registerUser(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response = await this.userDelegate.registerUser(body);
            return this.responseUtility.generateResponse(true, { isUserRegistered: response });
        } catch (error) {
            winston.error(JSON.stringify(error));
            return this.responseUtility.generateResponse(false, error);
        }
    }

    @Post('/login')
    async userLogin(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response = await this.userDelegate.loginUser(body);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            winston.error(JSON.stringify(error));
            return this.responseUtility.generateResponse(false, error);
        }
    }

    @Get('/user/:userID')
    async geUserDetails(@Req() req: express.Request, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let response = await this.userDelegate.getUserDetails(req.params.userID);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            winston.error(JSON.stringify(error));
            return this.responseUtility.generateResponse(false, error);
        }
    }
}
