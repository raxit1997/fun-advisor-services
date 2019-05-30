export class Shop {
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
    score: Score;
}

export class Score {
    positiveCustomerService: number;
    negativeCustomerService: number;
    positiveQuality: number;
    negativeQuality: number;
    positiveAvailability: number;
    negativeAvailability: number;
    positiveWorthForPrice: number;
    negativeWorthForPrice: number;
    positiveOthers: number;
    negativeOthers: number;
}