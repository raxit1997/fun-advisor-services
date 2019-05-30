export class Config {
    public static HASH_SECRET: string = 'ZBUILD_FUN_ADVISOR';
    public static ZOMATO_BASE_URL: string = 'https://developers.zomato.com/api/v2.1';
    public static ZOMATO_API_KEY: string = '5ae753e3075641abcce1461597766c79';
    public static ELASTiC_SEARCH_HOST: string = '2d1d92f7f88044a597e8b7f45042d1de.ap-southeast-1.aws.found.io';
    public static ELASTIC_SEARCH_AUTH: string = 'elastic:2RAFiQEpX3SoghfSLq8djmlV';
    public static ELASTIC_SEARCH_PORT: number = 9243;
    public static USER_TABLE = {
        INDEX: 'user',
        MAPPING: 'user-detail'
    };
    public static USER_PLACES_TABLE = {
        INDEX: 'user-places',
        MAPPING: 'user-places-detail'
    };
    public static USER_CATEGORY_TABLE = {
        INDEX: 'user-category',
        MAPPING: 'user-category-detail'
    };
    public static PLACES_REVIEW_TABLE = {
        INDEX: 'places',
        MAPPING: 'places-detail'
    };
    public static WATSON_API_KEY : string = 'zVGmCt-qPvwIrXNFzlcV9l399ArWG1d93kcSa7BWBTi-';
    public static WATSON_CLASSIFIER : string = '5a2fdax550-nlc-2572';
    public static GOOGLE_PLACES_KEY : string = 'AIzaSyCCGb_0fod9vxW27A5iuYwNbW_x2JiCAvc';
}
