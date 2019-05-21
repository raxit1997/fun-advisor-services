import 'reflect-metadata';
import { Service } from 'typedi';
import { get } from 'request';

@Service('zomato.api')
export class ZomatoAPI {

    constructor() { }

    async fetchData(requestURL: string) {
        try {
            return new Promise((resolve: any, reject: any) => {
                get(requestURL, {
                    headers: {
                        "user-key": '5ae753e3075641abcce1461597766c79'
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