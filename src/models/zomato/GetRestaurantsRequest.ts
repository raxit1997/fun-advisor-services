export class GetRestaurantsRequest {
    latitude: string
    longitude: string
    cuisineID: number;
    sortBy: string;
    radius: number;
    order: string;
    start: number;
    cuisines: string;
}