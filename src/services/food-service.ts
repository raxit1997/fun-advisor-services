import 'reflect-metadata';
import { Service, Inject } from 'typedi';
import { get } from 'request';
import { Config } from '../config/config';
import { RestaurantResponse } from '../models/zomato/RestaurantResponse';
import { ReviewResponse } from '../models/zomato/ReviewResponse';
import { ElasticSearchQueryBuilder, QueryProperties } from '../utils/elastic-search-query-builder';
import { ElasticSearch } from './elastic-search';
import { CollectionResponse } from '../models/zomato/CollectionResponse';
import { CityResponse } from '../models/zomato/CityResponse';
import { EstablishmentResponse } from '../models/zomato/EstablishmentResponse';
import { CuisineResponse } from '../models/zomato/CuisineResponse';
import { CategoryResponse } from '../models/zomato/CategoryResponse';

@Service('food.service')
export class FoodService {

    constructor(@Inject('elastic.search') private elasticSearch: ElasticSearch) { }

    public async fetchRestaurantResponse(response: any) {
        try {
            let results = new Array<RestaurantResponse>();
            let places: Array<string> = [];
            let restaurants = response.restaurants;
            if(restaurants) {
                restaurants.forEach((restaurant: any) => {
                    places.push(restaurant.restaurant.id);
                });
                let elasticSearchQueryBuilder: ElasticSearchQueryBuilder = new ElasticSearchQueryBuilder();
                elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { terms: { placeID: places } });
                let placesResponse: Array<any> = await this.elasticSearch.fetchDataByQuery(elasticSearchQueryBuilder.query, Config.PLACES_TABLE.INDEX, Config.PLACES_TABLE.MAPPING);
                restaurants.forEach((restaurantObject: any) => {
                    let restaurant = restaurantObject.restaurant;
                    let restaurantResponse = new RestaurantResponse();
                    restaurantResponse.cost = restaurant.average_cost_for_two;
                    restaurantResponse.cuisines = restaurant.cuisines;
                    restaurantResponse.restaurantID = restaurant.id;
                    restaurantResponse.restaurantName = restaurant.name;
                    // fix image URL
                    restaurantResponse.imageURL = "";
                    restaurantResponse.priceRange = restaurant.price_range;
                    if(restaurant.location) {
                        restaurantResponse.city = restaurant.location.city;
                        restaurantResponse.address = restaurant.location.address;
                    }
                    if(restaurant.user_rating) {
                        restaurantResponse.rating = Number(restaurant.user_rating.aggregate_rating);
                        restaurantResponse.votes = Number(restaurant.user_rating.votes);
                        restaurantResponse.ratingText = restaurant.user_rating.rating_text;
                        for (let index = 0; index < placesResponse.length; index++) {
                            if (placesResponse[index]._id === restaurant.id) {
                                restaurantResponse.rating = placesResponse[index]._source.averageRating;
                                restaurantResponse.votes = placesResponse[index]._source.ratingCount;
                                break;
                            }
                        }
                    }
                    if (restaurantResponse.cuisines.length > 0) {
                        results.push(restaurantResponse);
                    }
                });
        
            }
            return results;
    
        } catch (error) {
            console.log(error);
        }
    }

    public fetchReviews(response: any) {
        try {
            let results = new Array<ReviewResponse>();
            let reviews = response.user_reviews;
            reviews.forEach((reviewResult: any) => {
                let reviewObject = new ReviewResponse();
                let review = reviewResult.review;
                reviewObject.reviewID = review.id;
                reviewObject.rating = review.rating;
                reviewObject.ratingText = review.rating_text;
                reviewObject.reviewText = review.review_text;
                reviewObject.likes = review.likes;
                if(review.user) {
                reviewObject.username = review.user.name;
                }
                results.push(reviewObject);
            });
            return results;
        } catch(error) {
            console.log(error);
        }
    }

    public fetchCollections(response: any) {
        try {
            let results = new Array<CollectionResponse>();
            let collections = response.collections;
            collections.forEach((collectionResult: any) => {
                let collectionObject = new CollectionResponse();
                let collection = collectionResult.collection;
                collectionObject.id = collection.collection_id;
                collectionObject.description = collection.description;
                collectionObject.title = collection.title;
                collectionObject.imageURL = collection.image_url;
                results.push(collectionObject);
            });
            return results;
        } catch(error) {
            console.log(error);
        }
    }

    public fetchCity(response: any) {
        try {
            const location = response.location_suggestions;
            let city = new CityResponse();
            city.cityID = location[0].id;
            city.countryID = location[0].country_id;
            city.name = location[0].name;
            city.countryName = location[0].country_name;
            return city;
            
        } catch(error) {
            console.log(error);
        }
    }

    public fetchEstablishments(response: any) {
        try {
            let results = new Array<EstablishmentResponse>();
            let establishments = response.establishments;
            establishments.forEach((establishmentResult: any) => {
                results.push(establishmentResult.establishment);
            });
            return results;
        } catch(error) {
            console.log(error);
        }
    }

    public fetchCuisines(response: any) {
        try {
            let results = new Array<CuisineResponse>();
            let cuisines = response.cuisines;
            cuisines.forEach((cuisineResult: any) => {
                let cuisineObject = new CuisineResponse();
                let cuisine = cuisineResult.cuisine;
                cuisineObject.id = cuisine.cuisine_id;
                cuisineObject.name = cuisine.cuisine_name;
                results.push(cuisineObject);
            });
            return results;
        } catch(error) {
            console.log(error);
        }
    }

    public fetchCategories(response: any) {
        try {
            let results = new Array<CategoryResponse>();
            let categories = response.categories;
            categories.forEach((categoryResult: any) => {
                let categoryObject = new CategoryResponse();
                let category = categoryResult.categories;
                categoryObject.id = category.id;
                categoryObject.name = category.name;
                results.push(categoryObject);
            });
            return results;
        } catch(error) {
            console.log(error);
        }
    }
}