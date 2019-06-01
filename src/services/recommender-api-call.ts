import 'reflect-metadata';
import { Service } from 'typedi';
import { get, post } from 'request';
import { Config } from '../config/config';
import { Places, UserPlaces } from '../models/user/ESMapping';
import { RecommenderModel } from '../models/zomato/RecommenderModel';
import { RestaurantResponse } from '../models/zomato/RestaurantResponse';

@Service('recommender.api')
export class RecommenderAPI {

    constructor() { }

    async fetchData(placesData: RecommenderModel) {
        try {
            const requestURL = `http://localhost:5002/recommendations`
            return new Promise((resolve: any, reject: any) => {
            post({
                url: requestURL,
                body: placesData,
                json: true
              }, (err: any, response: any, body: any) => {
                    if (err || response.statusCode !== 200) {
                        reject(err || new Error(`Status code ${response.statusCode}`));
                    } else {
                        console.log(body)
                        resolve(body);
                    }
                });
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async setDataForRecommender(places: Array<RestaurantResponse>) {
        let userPlace = new UserPlaces("1","69269","Food",["Cafe, Desserts, Beverages, Sandwich"]);
        let recommender = new RecommenderModel();
        recommender.places = places;
        recommender.userPlaces = [userPlace];
        let response = await this.fetchData(recommender);
        return response;
    }

}