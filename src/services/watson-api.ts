import 'reflect-metadata';
import { Service } from 'typedi';
import { Config } from '../config/config';
const NaturalLanguageClassifierV1 = require('watson-developer-cloud/natural-language-classifier/v1');

@Service('watson.api')
export class WatsonAPI {

    naturalLanguageClassifier: any;
    constructor() {
        this.naturalLanguageClassifier = new NaturalLanguageClassifierV1({
            iam_apikey: Config.WATSON_API_KEY
        });
    }

    async classify(text: string) {
        try {
            return new Promise((resolve: any, reject: any) => {
                this.naturalLanguageClassifier.classify({
                    text: text,
                    classifier_id: Config.WATSON_API_KEY
                },
                    function (err: any, response: any) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(response);
                        }
                    });
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

}