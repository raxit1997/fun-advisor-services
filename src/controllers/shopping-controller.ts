import { Controller, Get, Req, Res, Body } from 'routing-controllers';
import { Service, Inject } from 'typedi';
import { ResponseUtility } from '../utils/response-utility';
import { GoogleMapsAPI, ElasticSearch } from '../services/di.config';
import { Shop } from '../models/Shops/Shop';
import { Config } from '../config/Config';
import { ElasticSearchQueryBuilder, QueryProperties } from '../utils/elastic-search-query-builder';

@Service()
@Controller()
export class ShoppingController {

    responseUtility: ResponseUtility;

    constructor(@Inject('google.maps.api') private googleMapsAPI: GoogleMapsAPI,
        @Inject('elastic.search') private elasticSearch: ElasticSearch) {
        this.responseUtility = new ResponseUtility();
    }



    @Get('/shopResults/:text')
    async searchShops(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let latitude = req.headers.latitude;
            let longitude = req.headers.longitude;
            let queryString = req.params.text;
            let requestURL = `https://maps.googleapis.com/maps/api/place/textsearch/json?key=${Config.GOOGLE_PLACES_KEY}&query=${queryString}&location=${latitude},${longitude}`;
            if (req.headers.nextpagetoken) {
                requestURL = `${requestURL}&pagetoken=${req.headers.nextpagetoken}`;
            }
            let response: any = await this.googleMapsAPI.fetchData(requestURL);
            let token = response.next_page_token;
            let result = await this.retrieveShopResults(response);
            return this.responseUtility.generateResponse(true, { results: result, token: token });
        } catch (err) {
            return { isSuccess: false };
        }

    }


    private async retrieveShopResults(response: any) {
        let results: Shop[] = new Array<Shop>();
        let places: Array<string> = new Array<string>();
        let candidates = response.results;
        let elasticSearchQueryBuilder: ElasticSearchQueryBuilder = new ElasticSearchQueryBuilder();
        candidates.forEach((candidate: any) => {
            places.push(candidate.place_id);
        });
        elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { terms: { placeID: places } });
        let placesResponse: Array<any> = await this.elasticSearch.fetchDataByQuery(elasticSearchQueryBuilder.query, Config.PLACES_TABLE.INDEX, Config.PLACES_TABLE.MAPPING);
        candidates.forEach((candidate: any) => {
            let shop = new Shop();
            shop.name = candidate.name;
            shop.address = candidate.formatted_address;
            shop.openNow = candidate.opening_hours ? candidate.opening_hours.open_now : '-';
            shop.placeId = candidate.place_id;
            if(candidate.rating === 0) {
                candidate.rating = '-';
            }
            shop.rating = candidate.rating ;
            shop.types = candidate.types;
            shop.latitude = candidate.geometry.lat;
            shop.longitude = candidate.geometry.lng;
            shop.ratingCount = candidate.user_ratings_total;
            for (let index = 0; index < placesResponse.length; index++) {
                if (placesResponse[index]._id === candidate.place_id) {
                    shop.rating = placesResponse[index]._source.averageRating === 0? placesResponse[index]._source.averageRating : placesResponse[index]._source.averageRating.toFixed(1);
                    shop.ratingCount = placesResponse[index]._source.ratingCount;
                    break;
                }
            }
            if (candidate.photos && candidate.photos.length > 0) {
                shop.photoReference = candidate.photos[0].photo_reference;
                shop.imageLink = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${shop.photoReference}&key=AIzaSyCCGb_0fod9vxW27A5iuYwNbW_x2JiCAvc`;
            }
            results.push(shop);
        });

        return results;

    }

}
