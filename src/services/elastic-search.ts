import 'reflect-metadata';

import * as elasticsearch from 'elasticsearch';
import { Service } from 'typedi';
import winston = require('winston');

@Service('elastic.search')
export class ElasticSearch {

    constructor() { }

    async fetchData(query: any, indexName?: string, mappingName?: string) {
        try {
            const client = new elasticsearch.Client({
                host: [
                    {
                        host: '83c56dd104d442678db316c14b4ce4d8.us-central1.gcp.cloud.es.io',
                        auth: 'elastic:wazGK1ZmRmpCFdCMdvBtVP02',
                        protocol: 'https',
                        port: 9243
                    }
                ]
            });
            const response = await client.search({
                index: indexName,
                type: mappingName,
                body: query
            });
            return response;
        } catch (error) {
            winston.error(JSON.stringify(error));
            return Promise.reject(error);
        }
    }

}