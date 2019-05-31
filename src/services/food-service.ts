import 'reflect-metadata';
import { Service } from 'typedi';
import { get } from 'request';
import { Config } from '../config/config';
import { RestaurantResponse } from '../models/zomato/RestaurantResponse';

@Service('food.service')
export class FoodService {

    constructor() { }

    public fetchRestaurantResponse(response: any) {
        try {
            let results = new Array<RestaurantResponse>();;
            let restaurants = response.restaurants;
            if(restaurants) {
                restaurants.forEach((restaurantObject: any) => {
                    let restaurant = restaurantObject.restaurant;
                    let restaurantResponse = new RestaurantResponse();
                    restaurantResponse.cost = restaurant.average_cost_for_two;
                    restaurantResponse.cuisines = restaurant.cuisines;
                    restaurantResponse.restaurantID = restaurant.id;
                    restaurantResponse.restaurantName = restaurant.name;
                    restaurantResponse.city = 
                    // fix image URL
                    restaurantResponse.imageURL = "";
                    restaurantResponse.priceRange = restaurant.price_range;
                    if(restaurant.location) {
                        restaurantResponse.city = restaurant.location.city;
                        restaurantResponse.address = restaurant.location.address;
                    }
                    if(restaurant.user_rating) {
                        restaurantResponse.rating = restaurant.user_rating.aggregate_rating;
                        restaurantResponse.votes = restaurant.user_rating.votes;
                        restaurantResponse.ratingText = restaurant.user_rating.rating_text;
                    }
                    results.push(restaurantResponse);
                });
        
            }
            return results;
    
        } catch (error) {
            console.log(error);
        }
    }

}