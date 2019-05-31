import { UserActivity } from "../../constants/UserActivity";

export class UserCategory {

    userID: string;
    categoryName: string;
    subCategories: Array<SubCategory>;

    constructor(userID: string, categoryName: string) {
        this.userID = userID;
        this.categoryName = categoryName;
        this.subCategories = new Array<SubCategory>();
    }
}

export class UserPlaces {

    userID: string;
    placeID: string;
    categoryName: string;
    subCategories: Array<string>;
    ratings: number = 0;
    visited: boolean = false;

    constructor(userID: string, placeID: string, categoryName: string, subCategories: Array<string>) {
        this.userID = userID;
        this.placeID = placeID;
        this.categoryName = categoryName;
        this.subCategories = subCategories;
    }

}

export class Places {

    placeID: string;
    averageRating: number = 0;
    ratingCount: number = 0;
    reviews: Array<any> = [];
    reviewsTagScore: ReviewsTagScore;
    priceRange: number;
    budget: number;
    budgetNoOfPeople: number;

    constructor(placeID: string, averageRating: number, ratingCount: number, priceRange?: number, budget?: number, budgetNoOfPeople?: number) {
        this.placeID = placeID;
        this.averageRating = averageRating;
        this.ratingCount = ratingCount;
        this.priceRange = priceRange;
        this.budget = budget;
        this.budgetNoOfPeople = budgetNoOfPeople;
        this.reviewsTagScore = new ReviewsTagScore();
    }

}

export class ReviewsTagScore {
    PositiveCustomerService: number = 0;
    NegativeCustomerService: number = 0;
    PositiveQuality: number = 0;
    NegativeWorthForPrice: number = 0;
    PositiveAvailability: number = 0;
    Positive: number = 0;
    NegativeAvailability: number = 0;
    NegativeQuality: number = 0;
    PositiveWorthForPrice: number = 0;
    Negative: number = 0;
}

export class SubCategory {
    category: string;
    activityScore: UserActivity;
}