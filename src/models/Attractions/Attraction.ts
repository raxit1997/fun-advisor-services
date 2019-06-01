import { ReviewsTagScore } from "../user/ESMapping";

export class  Attraction {
    address: string;
    name: string;
    openNow: boolean;
    rating: number;
    placeId: string;
    photoReference: string;
    types: string[];
    latitude: string;
    longitude: string;
    imageLink: string;
    ratings: number;
    reviews: string[];
    ratingCount: number;
    score: ReviewsTagScore;
}
