import 'reflect-metadata';
import { Service } from 'typedi';
const NaturalLanguageClassifierV1 = require('watson-developer-cloud/natural-language-classifier/v1');

@Service('watson.api')
export class WatsonAPI {

    naturalLanguageClassifier : any;
    constructor() {
        this.naturalLanguageClassifier = new NaturalLanguageClassifierV1({
            iam_apikey: 'zVGmCt-qPvwIrXNFzlcV9l399ArWG1d93kcSa7BWBTi-'
        });
     }

    async classify(text : string) {
        try {
            return new Promise((resolve: any, reject: any) => {
                this.naturalLanguageClassifier.classify({
                    text: text,
                    classifier_id: '5a2fdax550-nlc-2572' },
                    function(err : any, response : any) {
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