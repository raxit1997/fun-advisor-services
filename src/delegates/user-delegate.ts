import { Inject } from 'typedi';
import winston = require('winston');

import { UserRegisterRequest } from '../models/user/UserRegisterRequest';
import { ElasticSearch } from '../services/elastic-search';
import * as crypto from 'crypto';
import { LoginUserRequest } from '../models/user/LoginUserRequest';
import { GetUserResponse } from '../models/user/GetUserResponse';
import { Config } from '../config/config';
import { UserPlacesRequest } from '../models/user/UserPlacesRequest';
import { ElasticSearchQueryBuilder, QueryProperties } from '../utils/elastic-search-query-builder';
import { UserActivity } from '../constants/UserActivity';
import { UserCategory, SubCategory } from '../models/user/UserCategory';

export class UserDelegate {

    constructor(@Inject('elastic.search') private elasticSearch: ElasticSearch) { }

    async registerUser(body: UserRegisterRequest): Promise<any> {
        try {
            let salt: string = crypto.randomBytes(16).toString('hex');
            body.password = crypto.pbkdf2Sync(body.password, salt + Config.HASH_SECRET, 1000, 64, 'sha512').toString('hex');
            body.salt = salt;
            let response = await this.elasticSearch.insertData(body, Config.USER_TABLE.INDEX, Config.USER_TABLE.MAPPING, body.userID);
            return response.result === 'created';
        } catch (error) {
            winston.error(JSON.stringify(error));
            return false;
        }
    }

    async getUserDetails(userID: string) {
        try {
            let response: any = await this.elasticSearch.fetchDataByID(userID, Config.USER_TABLE.INDEX, Config.USER_TABLE.MAPPING);
            if (!response) {
                return { userDetailsNotFound: true };
            } else {
                let getUserResponse: GetUserResponse = new GetUserResponse(response.userID, response.firstName, response.lastName, response.contact, response.lastName, response.latitude, response.longitude);
                return getUserResponse;
            }
        } catch (error) {
            winston.error(JSON.stringify(error));
            return Promise.reject('');
        }
    }

    async loginUser(body: LoginUserRequest): Promise<any> {
        try {
            let response: any = await this.elasticSearch.fetchDataByID(body.userID, Config.USER_TABLE.INDEX, Config.USER_TABLE.MAPPING);
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

    async searchedPlace(body: UserPlacesRequest) {
        try {
            let elasticSearchQueryBuilder: ElasticSearchQueryBuilder = new ElasticSearchQueryBuilder();
            elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { userID: body.userID } });
            elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { categoryName: body.categoryName } });
            let userCategoryData: Array<any> = await this.elasticSearch.fetchDataByQuery(elasticSearchQueryBuilder.query, Config.USER_CATEGORY_TABLE.INDEX, Config.USER_CATEGORY_TABLE.MAPPING);
            if (userCategoryData.length == 0) {
                await this.initializeUserCategory(body, UserActivity.SEARCHED);
            } else {
                await this.updateUserCategoryData(userCategoryData[0]._source, UserActivity.SEARCHED, body);
            }
        } catch (error) {
            winston.error(JSON.stringify(error));
            return Promise.reject('');
        }
    }

    async visitedPlace(body: UserPlacesRequest) {
        try {
            let elasticSearchQueryBuilder: ElasticSearchQueryBuilder = new ElasticSearchQueryBuilder();
            elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { userID: body.userID } });
            elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { categoryName: body.categoryName } });
            let userCategoryData: Array<any> = await this.elasticSearch.fetchDataByQuery(elasticSearchQueryBuilder.query, Config.USER_CATEGORY_TABLE.INDEX, Config.USER_CATEGORY_TABLE.MAPPING);
            if (userCategoryData.length == 0) {
                await this.initializeUserCategory(body, UserActivity.VISITED);
            } else {
                await this.updateUserCategoryData(userCategoryData[0]._source, UserActivity.VISITED, body);
            }
        } catch (error) {
            winston.error(JSON.stringify(error));
            return Promise.reject('');
        }
    }

    async ratedPlace(body: UserPlacesRequest) {
        try {
            let userPlacesData: UserPlacesRequest = await this.elasticSearch.fetchDataByID(`${body.userID}:::${body.placeID}`, Config.USER_PLACES_TABLE.INDEX, Config.USER_PLACES_TABLE.MAPPING);
            userPlacesData.ratings = body.ratings;
            this.elasticSearch.updateData(userPlacesData, Config.USER_PLACES_TABLE.INDEX, Config.USER_PLACES_TABLE.MAPPING, `${body.userID}:::${body.placeID}`);
            let elasticSearchQueryBuilder: ElasticSearchQueryBuilder = new ElasticSearchQueryBuilder();
            elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { userID: body.userID } });
            elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { subCategories: body.subCategories } });
            let userCategoryData: Array<any> = await this.elasticSearch.fetchDataByQuery(elasticSearchQueryBuilder.query, Config.USER_CATEGORY_TABLE.INDEX, Config.USER_CATEGORY_TABLE.MAPPING);
            if (userCategoryData.length == 0) {
                await this.initializeUserCategory(body, UserActivity.REVIEWED);
            } else {
                await this.updateUserCategoryData(userCategoryData[0]._source, UserActivity.REVIEWED, body);
            }
        } catch (error) {
            winston.error(JSON.stringify(error));
            return Promise.reject('');
        }
    }

    async addReviews(body: UserPlacesRequest) {
        try {
            let userPlacesData: any = await this.elasticSearch.fetchDataByID(`${body.placeID}:::reviews`, Config.USER_PLACES_TABLE.INDEX, Config.USER_PLACES_TABLE.MAPPING);
            userPlacesData.reviews.push({ userID: body.userID, review: body.reviews[0] });
            this.elasticSearch.updateData(userPlacesData, Config.USER_PLACES_TABLE.INDEX, Config.USER_PLACES_TABLE.MAPPING, `${body.userID}:::${body.placeID}`);
            let elasticSearchQueryBuilder: ElasticSearchQueryBuilder = new ElasticSearchQueryBuilder();
            elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { userID: body.userID } });
            elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { categoryName: body.categoryName } });
            let userCategoryData: Array<any> = await this.elasticSearch.fetchDataByQuery(elasticSearchQueryBuilder.query, Config.USER_CATEGORY_TABLE.INDEX, Config.USER_CATEGORY_TABLE.MAPPING);
            if (userCategoryData.length == 0) {
                await this.initializeUserCategory(body, UserActivity.REVIEWED);
            } else {
                await this.updateUserCategoryData(userCategoryData[0]._source, UserActivity.REVIEWED, body);
            }
        } catch (error) {
            winston.error(JSON.stringify(error));
            return Promise.reject('');
        }
    }

    async getPlaceOverview(placeID: string) {
        try {
            let elasticSearchQueryBuilder: ElasticSearchQueryBuilder = new ElasticSearchQueryBuilder();
            elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { placeID: placeID } });
            let placesOverviewData = await this.elasticSearch.fetchDataByQuery(elasticSearchQueryBuilder.query, Config.PLACES_REVIEW_TABLE.INDEX, Config.PLACES_REVIEW_TABLE.MAPPING);
            return placesOverviewData[0];
        } catch (error) {
            winston.error(JSON.stringify(error));
            return Promise.reject('');
        }
    }

    private async initializeUserCategory(body: UserPlacesRequest, activity: UserActivity) {
        try {
            let userCategory: UserCategory = new UserCategory(body.userID, body.categoryName);
            await this.elasticSearch.insertData(userCategory, Config.USER_CATEGORY_TABLE.INDEX, Config.USER_CATEGORY_TABLE.MAPPING, `${body.userID}:::${body.categoryName}`);
            await this.updateUserCategoryData(userCategory, activity, body);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject('');
        }
    }

    private async updateUserCategoryData(userCategoryData: UserCategory, activity: UserActivity, body: UserPlacesRequest) {
        let categoriesFromDB: Array<string> = [];
        userCategoryData.subCategories.forEach((subCategory: SubCategory) => {
            categoriesFromDB.push((subCategory.category));
            if (body.subCategories.indexOf(subCategory.category) >= 0) {
                subCategory.activityScore += activity;
            }
        });
        body.subCategories.forEach((subCategory: string) => {
            if (categoriesFromDB.indexOf(subCategory) < 0) {
                userCategoryData.subCategories.push({ category: subCategory, activityScore: activity });
            }
        });
        await this.elasticSearch.updateData(userCategoryData, Config.USER_CATEGORY_TABLE.INDEX, Config.USER_CATEGORY_TABLE.MAPPING, `${body.userID}:::${body.categoryName}`);
    }
}
