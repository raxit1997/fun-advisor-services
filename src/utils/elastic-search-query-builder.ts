export enum QueryProperties {
    QueryInclude = 'query.bool.must',
    QueryNotInclude = 'query.bool.must_not',
    BaseAggregation = 'aggs',
};

export class ElasticSearchQueryBuilder {
    query: any = {
        size: 500,
        query: {
            bool: {
                must: [],
                must_not: []
            }
        },
        aggs: {}
    };

    constructor() { }
    /**
     * Adds a value into the query structure based on the path, existing values will get replaced
     * @param path query structure path
     * @param value value to add to the path
     */
    addProperty(path: String, value: any) {
        const keys = path.split('.');
        const key = keys[keys.length - 1];
        const obj = keys.reduce((accumulator, currentValue, index) => {
            return (index === keys.length - 1) ? accumulator : accumulator[currentValue];
        }, this.query);
        if (obj[key] instanceof Array) {
            obj[key].push(value);
        } else {
            obj[key] = value;
        }
    }
    /**
     * Merges a value Object|Array with an Object|Array at the provided path, value properties get preference
     * @param path query structure path
     * @param value value to merge into the path
     */
    mergeProperty(path: String, value: Object | Array<any>) {
        const keys = path.split('.');
        const key = keys[keys.length - 1];
        const obj = keys.reduce((accumulator, currentValue, index) => {
            return (index === keys.length - 1) ? accumulator : accumulator[currentValue];
        }, this.query);
        if (obj[key] instanceof Array && value instanceof Array) {
            obj[key] = Object.assign([], obj[key], value);
        } else if (obj[key] instanceof Object && value instanceof Object) {
            obj[key] = Object.assign({}, obj[key], value);
        }
    }
}