import 'reflect-metadata';

import * as elasticsearch from 'elasticsearch';
import { Service } from 'typedi';
import winston = require('winston');

@Service('elastic.search')
export class ElasticSearch {

    client: elasticsearch.Client;

    constructor() {
        this.client = new elasticsearch.Client({
            host: [{
                host: '2d1d92f7f88044a597e8b7f45042d1de.ap-southeast-1.aws.found.io',
                auth: 'elastic:2RAFiQEpX3SoghfSLq8djmlV',
                protocol: 'https',
                port: 9243
            }]
        });
    }

    async fetchData(query: any, indexName: string, mappingName: string) {
        try {
            const response = await this.client.search({
                index: indexName,
                type: mappingName,
                body: query
            });
            return response.hits.hits;
        } catch (error) {
            winston.error(JSON.stringify(error));
            return Promise.reject(error);
        }
    }

    async fetchDataByID(id: string, indexName: string, mappingName: string) {
        try {
            const response = await this.client.get({
                id: id,
                index: indexName,
                type: mappingName
            });
            return response._source;
        } catch (error) {
            winston.error(JSON.stringify(error));
            return Promise.reject(error);
        }
    }

    async insertData(document: any, indexName: string, mappingName: string, id?: string) {
        try {
            const response = await this.client.create({
                id: id,
                index: indexName,
                type: mappingName,
                body: document
            });
            return response;
        } catch (error) {
            winston.error(JSON.stringify(error));
            return Promise.reject(error);
        }
    }

    async updateData(document: any, indexName: string, mappingName: string, id?: string) {
        try {
            const response = await this.client.update({
                id: id,
                index: indexName,
                type: mappingName,
                body: document
            });
            return response;
        } catch (error) {
            winston.error(JSON.stringify(error));
            return Promise.reject(error);
        }
    }

}
