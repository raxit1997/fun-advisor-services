import { RestaurantResponse } from "./RestaurantResponse";
import { RecommenderPlace } from "../user/RecommenderPlace";

export class RecommenderModel {
    places:RestaurantResponse[];
    userPlaces: RecommenderPlace[];

}