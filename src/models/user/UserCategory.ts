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

export class SubCategory {
    category: string;
    activityScore: UserActivity;
}