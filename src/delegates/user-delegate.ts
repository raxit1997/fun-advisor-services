import * as crypto from 'crypto';
import { Inject } from 'typedi';
import winston = require('winston');

import { Config } from '../config/config';
import { UserActivity } from '../constants/UserActivity';
import { Places, SubCategory, UserCategory, UserPlaces } from '../models/user/ESMapping';
import { GetUserResponse } from '../models/user/GetUserResponse';
import { LoginUserRequest } from '../models/user/LoginUserRequest';
import { PlacesOverviewResponse } from '../models/user/PlacesOverviewResponse';
import { UserPlacesRequest } from '../models/user/UserPlacesRequest';
import { UserRegisterRequest } from '../models/user/UserRegisterRequest';
import { ElasticSearch, WatsonAPI } from '../services/di.config';
import { ElasticSearchQueryBuilder, QueryProperties } from '../utils/elastic-search-query-builder';

export class UserDelegate {

    constructor(@Inject('elastic.search') private elasticSearch: ElasticSearch,
        @Inject('watson.api') private watsonAPI: WatsonAPI) { }

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

    // async searchedPlace(body: UserPlacesRequest) {
    //     try {
    //         let elasticSearchQueryBuilder: ElasticSearchQueryBuilder = new ElasticSearchQueryBuilder();
    //         elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { userID: body.userID } });
    //         elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { categoryName: body.categoryName } });
    //         let userCategoryData: Array<any> = await this.elasticSearch.fetchDataByQuery(elasticSearchQueryBuilder.query, Config.USER_CATEGORY_TABLE.INDEX, Config.USER_CATEGORY_TABLE.MAPPING);
    //         if (userCategoryData.length == 0) {
    //             await this.initializeUserCategory(body, UserActivity.SEARCHED);
    //         } else {
    //             await this.updateUserCategoryData(userCategoryData[0]._source, UserActivity.SEARCHED, body);
    //         }
    //     } catch (error) {
    //         winston.error(JSON.stringify(error));
    //         return Promise.reject('');
    //     }
    // }

    async visitedPlace(body: UserPlacesRequest) {
        try {
            await this.elasticSearch.updateData({ visited: true }, Config.USER_PLACES_TABLE.INDEX, Config.USER_PLACES_TABLE.MAPPING, `${body.userID}:::${body.placeID}`);
            return Promise.resolve();
            // let elasticSearchQueryBuilder: ElasticSearchQueryBuilder = new ElasticSearchQueryBuilder();
            // elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { userID: body.userID } });
            // elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { categoryName: body.categoryName } });
            // let userCategoryData: Array<any> = await this.elasticSearch.fetchDataByQuery(elasticSearchQueryBuilder.query, Config.USER_CATEGORY_TABLE.INDEX, Config.USER_CATEGORY_TABLE.MAPPING);
            // if (userCategoryData.length == 0) {
            //     await this.initializeUserCategory(body, UserActivity.VISITED);
            // } else {
            //     await this.updateUserCategoryData(userCategoryData[0]._source, UserActivity.VISITED, body);
            // }
        } catch (error) {
            winston.error(JSON.stringify(error));
            return Promise.reject('');
        }
    }

    async ratedPlace(body: UserPlacesRequest) {
        try {
            let placesOverviewData: any = await this.elasticSearch.fetchDataByID(`${body.placeID}`, Config.PLACES_TABLE.INDEX, Config.PLACES_TABLE.MAPPING);
            let averageRatings: number = ((placesOverviewData.averageRating * placesOverviewData.ratingCount) + body.ratings) / (placesOverviewData.ratingCount + 1);
            placesOverviewData.averageRating = averageRatings;
            placesOverviewData.ratingCount++;
            // let elasticSearchQueryBuilder: ElasticSearchQueryBuilder = new ElasticSearchQueryBuilder();
            // elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { userID: body.userID } });
            // elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { categoryName: body.categoryName } });
            await Promise.all([
                this.elasticSearch.updateData(placesOverviewData, Config.PLACES_TABLE.INDEX, Config.PLACES_TABLE.MAPPING, `${body.placeID}`),
                // this.elasticSearch.fetchDataByQuery(elasticSearchQueryBuilder.query, Config.USER_CATEGORY_TABLE.INDEX, Config.USER_CATEGORY_TABLE.MAPPING),
                this.elasticSearch.updateData({ ratings: body.ratings }, Config.USER_PLACES_TABLE.INDEX, Config.USER_PLACES_TABLE.MAPPING, `${body.userID}:::${body.placeID}`)
            ]);
            return Promise.resolve();
            // let userCategoryData: Array<any> = responses[2];
            // if (userCategoryData.length == 0) {
            //     await this.initializeUserCategory(body, UserActivity.REVIEWED);
            // } else {
            //     await this.updateUserCategoryData(userCategoryData[0]._source, UserActivity.REVIEWED, body);
            // }
        } catch (error) {
            winston.error(JSON.stringify(error));
            return Promise.reject('');
        }
    }

    async addReviews(body: UserPlacesRequest) {
        try {
            let responses: any = await Promise.all([
                this.elasticSearch.fetchDataByID(`${body.placeID}`, Config.PLACES_TABLE.INDEX, Config.PLACES_TABLE.MAPPING),
                this.watsonAPI.classify(body.reviews)
            ]);
            let userPlacesData: any = responses[0];
            let classifierResponse: any = responses[1];
            userPlacesData.reviews.push({ userID: body.userID, review: body.reviews });
            let maxElement: number = classifierResponse.classes[0].confidence;
            userPlacesData.reviewsTagScore[Config.WATSON_REVIEW_CLASSIFIERS[classifierResponse.classes[0].class_name]] += 1;
            classifierResponse.classes.splice(0, 1);
            let quantifier: number = 1 - maxElement;
            classifierResponse.classes.forEach((classifier: any) => {
                if (((classifier.confidence / quantifier) * 100) > 60) {
                    userPlacesData.reviewsTagScore[Config.WATSON_REVIEW_CLASSIFIERS[classifier.class_name]] += 1;
                }
            });
            await this.elasticSearch.updateData(userPlacesData, Config.PLACES_TABLE.INDEX, Config.PLACES_TABLE.MAPPING, `${body.placeID}`);
            return userPlacesData;
            // let elasticSearchQueryBuilder: ElasticSearchQueryBuilder = new ElasticSearchQueryBuilder();
            // elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { userID: body.userID } });
            // elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { match: { categoryName: body.categoryName } });
            // let userCategoryData: Array<any> = await this.elasticSearch.fetchDataByQuery(elasticSearchQueryBuilder.query, Config.USER_CATEGORY_TABLE.INDEX, Config.USER_CATEGORY_TABLE.MAPPING);
            // if (userCategoryData.length == 0) {
            //     await this.initializeUserCategory(body, UserActivity.REVIEWED);
            // } else {
            //     await this.updateUserCategoryData(userCategoryData[0]._source, UserActivity.REVIEWED, body);
            // }
        } catch (error) {
            winston.error(JSON.stringify(error));
            return Promise.reject('');
        }
    }

    async getPlaceOverview(body: any) {
        try {
            let request1 = this.elasticSearch.fetchDataByID(`${body.userID}:::${body.placeID}`, Config.USER_PLACES_TABLE.INDEX, Config.USER_PLACES_TABLE.MAPPING);
            let request2 = this.elasticSearch.fetchDataByID(`${body.placeID}`, Config.PLACES_TABLE.INDEX, Config.PLACES_TABLE.MAPPING);
            let responses: any = await Promise.all([request1, request2]);
            if (!responses[1]) {
                await Promise.all([
                    this.initializeUserPlaces(body),
                    this.initializePlaces(body)
                ]);
                return {};
            } else if (!responses[0]) {
                let placeOverviewResponse: PlacesOverviewResponse = Object.assign({}, responses[1]);
                await this.initializeUserPlaces(body);
                return placeOverviewResponse;
            }
            let placeOverviewResponse: PlacesOverviewResponse = Object.assign({}, responses[1]);
            placeOverviewResponse.ratings = responses[0].ratings;
            placeOverviewResponse.visited = responses[0].visited;
            return placeOverviewResponse;
        } catch (error) {
            winston.error(JSON.stringify(error));
            return Promise.reject('');
        }
    }

    // private async initializeUserCategory(body: UserPlacesRequest, activity: UserActivity) {
    //     try {
    //         let userCategory: UserCategory = new UserCategory(body.userID, body.categoryName);
    //         await this.updateUserCategoryData(userCategory, activity, body, true);
    //         return Promise.resolve();
    //     } catch (error) {
    //         return Promise.reject('');
    //     }
    // }

    private async initializeUserPlaces(body: UserPlacesRequest) {
        try {
            let userPlaces: UserPlaces = new UserPlaces(body.userID, body.placeID, body.categoryName, body.subCategories);
            await this.elasticSearch.insertData(userPlaces, Config.USER_PLACES_TABLE.INDEX, Config.USER_PLACES_TABLE.MAPPING, `${body.userID}:::${body.placeID}`);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject('');
        }
    }

    private async initializePlaces(body: any) {
        try {
            let places: Places = new Places(body.placeID, body.averageRating, body.ratingCount, body.priceRange, body.budget, body.budgetNoOfPeople);
            await this.elasticSearch.insertData(places, Config.PLACES_TABLE.INDEX, Config.PLACES_TABLE.MAPPING, `${body.placeID}`);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject('');
        }
    }

    // private async updateUserCategoryData(userCategoryData: UserCategory, activity: UserActivity, body: UserPlacesRequest, isNewDocument?: boolean) {
    //     let categoriesFromDB: Array<string> = [];
    //     userCategoryData.subCategories.forEach((subCategory: SubCategory) => {
    //         categoriesFromDB.push((subCategory.category));
    //         if (body.subCategories.indexOf(subCategory.category) >= 0) {
    //             subCategory.activityScore += activity;
    //         }
    //     });
    //     body.subCategories.forEach((subCategory: string) => {
    //         if (categoriesFromDB.indexOf(subCategory) < 0) {
    //             userCategoryData.subCategories.push({ category: subCategory, activityScore: activity });
    //         }
    //     });
    //     if (isNewDocument) {
    //         await this.elasticSearch.insertData(userCategoryData, Config.USER_CATEGORY_TABLE.INDEX, Config.USER_CATEGORY_TABLE.MAPPING, `${body.userID}:::${body.categoryName}`);
    //     } else {
    //         await this.elasticSearch.updateData(userCategoryData, Config.USER_CATEGORY_TABLE.INDEX, Config.USER_CATEGORY_TABLE.MAPPING, `${body.userID}:::${body.categoryName}`);
    //     }
    // }
}
