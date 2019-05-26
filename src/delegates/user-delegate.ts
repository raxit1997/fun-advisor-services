import { Inject } from 'typedi';
import winston = require('winston');

import { UserRegisterRequest } from '../models/UserRegisterRequest';
import { ElasticSearch } from '../services/elastic-search';
import * as crypto from 'crypto';
import { LoginUserRequest } from '../models/LoginUserRequest';
import { GetUserResponse } from '../models/GetUserResponse';
import { Config } from '../config/config';

export class UserDelegate {

    constructor(@Inject('elastic.search') private elasticSearch: ElasticSearch) { }

    async registerUser(body: UserRegisterRequest): Promise<any> {
        try {
            let salt: string = crypto.randomBytes(16).toString('hex');
            body.password = crypto.pbkdf2Sync(body.password, salt + Config.HASH_SECRET, 1000, 64, 'sha512').toString('hex');
            body.salt = salt;
            let response = await this.elasticSearch.insertData(body, 'user', 'user_info', body.userID);
            return response.result === 'created';
        } catch (error) {
            winston.error(JSON.stringify(error));
            return { isSuccess: false };
        }
    }

    async getUserDetails(userID: string) {
        try {
            let response: any = await this.elasticSearch.fetchDataByID(userID, 'user', 'user_info');
            let getUserResponse: GetUserResponse = new GetUserResponse(response.userID, response.firstName, response.lastName, response.contact, response.lastName, response.latitude, response.longitude);
            return getUserResponse;
        } catch (error) {
            winston.error(JSON.stringify(error));
            return { isSuccess: false };
        }
    }

    async loginUser(body: LoginUserRequest): Promise<any> {
        try {
            let response: any = await this.elasticSearch.fetchDataByID(body.userID, 'user', 'user_info');
            let hash = crypto.pbkdf2Sync(body.password, response.salt + Config.HASH_SECRET, 1000, 64, 'sha512').toString('hex');
            if (hash === response.password) {
                let getUserResponse: GetUserResponse = new GetUserResponse(response.userID, response.firstName, response.lastName, response.contact, response.lastName, response.latitude, response.longitude);
                getUserResponse.isAuthenticated = true;
                return getUserResponse;
            } else {
                return { isAuthenticated: false };
            }
        } catch (error) {
            winston.error(JSON.stringify(error));
            return Promise.reject({ isAuthenticated: false });
        }
    }
}
