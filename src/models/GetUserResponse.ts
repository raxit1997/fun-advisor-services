export class GetUserResponse {

    userID: string;
    firstName: string;
    lastName: string;
    contact: string;
    latitude: Number;
    longitude: Number;
    location: string;
    isAuthenticated: boolean;
    
    constructor (userID: string, firstName: string, lastName: string, contact: string, location: string, latitude: Number, longitude: Number) {
        this.userID = userID;
        this.firstName = firstName;
        this.lastName = lastName;
        this.contact = contact;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
