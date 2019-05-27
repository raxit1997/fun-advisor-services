import 'reflect-metadata';
import { Service } from 'typedi';
import { get } from 'request';

@Service('movie.glu.api')
export class MovieGluAPI {

    url: string;
    constructor() {
        this.url = 'https://api-gate2.movieglu.com/'
    }


    async fetchData(requestURL: string, latitude: string, longitude: string) {
        try {
            requestURL = this.url + requestURL;
            console.log('fjd' , requestURL);
            console.log('la' , latitude);
            console.log('lo' , longitude);
            return new Promise((resolve: any, reject: any) => {
                get(requestURL, {
                    headers: {
                        "api-key": 'uoRQxRN49aas2zGT4Htry8NjyQMhLztnBFkcF4a2',
                        "api-version": 'v200',
                        "Authorization": 'Basic U09GVF81Ojd3OUR6aUFSWkswVQ==',
                        "client": 'SOFT_5',
                        "x-api-key": 'uoRQxRN49aas2zGT4Htry8NjyQMhLztnBFkcF4a2',
                        "device-datetime": '2019-05-21T15:27:34.033Z',
                        "territory": 'IN',
                        "Geolocation": `${latitude};${longitude}`,
                        "user_id": 'SOFT_5',
                    }
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