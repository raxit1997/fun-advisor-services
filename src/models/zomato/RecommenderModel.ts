import { UserPlaces } from "../user/ESMapping";
import { RestaurantResponse } from "./RestaurantResponse";

export class RecommenderModel {
    places:RestaurantResponse[];
    userPlaces: UserPlaces[];

}