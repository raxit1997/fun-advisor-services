export class UserPlacesRequest {
    userID: string;
    placeID: string;
    categoryName: string;
    subCategories: Array<string>;
    ratings: number;
    reviews: Array<string>;
    priceRange: number;
    budget: number;
    budgetNoOfPeople: number;
}
