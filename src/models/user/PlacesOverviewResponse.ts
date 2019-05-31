import { ReviewsTagScore } from "./ESMapping";

export class PlacesOverviewResponse {
    placeID: string;
    averageRating: number;
    ratingCount: number;
    reviews: Array<any>;
    reviewsTagScore: ReviewsTagScore;
    priceRange: number;
    budget: number;
    budgetNoOfPeople: number;
    ratings: number;
    visited: boolean;
}