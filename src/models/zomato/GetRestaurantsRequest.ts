export class GetRestaurantsRequest {
    userID: any;
    latitude: string
    longitude: string
    cuisineIDs?: string;
    sortBy: string;
    radius: number;
    order: string;
    start: number;
    cuisines: string;
    establishmentID?: string;
    categoryIDs?: string;
    collectionID?: string;
    searchQuery?: string;
}