import 'reflect-metadata';
import { Service } from 'typedi';
import { get } from 'request';

@Service('google.maps.api')
export class GoogleMapsAPI {

    url: string;
    constructor() {
        this.url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
    }


    async fetchData(requestURL: string) {
        try {
            return new Promise((resolve: any, reject: any) => {
                get(requestURL, {
                }, (err: any, response: any, body: any) => {
                    if (err || response.statusCode !== 200) {
                        reject(err || new Error(`Status code ${response.statusCode}`));
                    } else {
                        resolve(JSON.parse(body));
                    }
                });
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

}