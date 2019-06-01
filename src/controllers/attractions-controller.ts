import { Controller, Get, Req, Res, Body } from 'routing-controllers';
import { Service, Inject } from 'typedi';
import { ResponseUtility } from '../utils/response-utility';
import { GoogleMapsAPI, ElasticSearch } from '../services/di.config';
import { Shop } from '../models/Shops/Shop';
import { Config } from '../config/Config';
import { ElasticSearchQueryBuilder, QueryProperties } from '../utils/elastic-search-query-builder';
import { Attraction } from '../models/Attractions/Attraction';

@Service()
@Controller()
export class AttractionsController {

    responseUtility: ResponseUtility;

    constructor(@Inject('google.maps.api') private googleMapsAPI: GoogleMapsAPI,
        @Inject('elastic.search') private elasticSearch: ElasticSearch) {
        this.responseUtility = new ResponseUtility();
    }



    @Get('/attractionResults/:text')
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
            let result = await this.retrieveResults(response);
            return this.responseUtility.generateResponse(true, { results: result, token: token });
        } catch (err) {
            return { isSuccess: false };
        }

    }


    private async retrieveResults(response: any) {
        let results: Shop[] = new Array<Attraction>();
        let places: Array<string> = new Array<string>();
        let candidates = response.results;
        let elasticSearchQueryBuilder: ElasticSearchQueryBuilder = new ElasticSearchQueryBuilder();
        candidates.forEach((candidate: any) => {
            places.push(candidate.place_id);
        });
        elasticSearchQueryBuilder.addProperty(QueryProperties.QueryInclude, { terms: { placeID: places } });
        let placesResponse: Array<any> = await this.elasticSearch.fetchDataByQuery(elasticSearchQueryBuilder.query, Config.PLACES_TABLE.INDEX, Config.PLACES_TABLE.MAPPING);
        candidates.forEach((candidate: any) => {
            let attraction = new Attraction();
            attraction.name = candidate.name;
            attraction.address = candidate.formatted_address;
            attraction.openNow = candidate.opening_hours ? candidate.opening_hours.open_now : '-';
            attraction.placeId = candidate.place_id;
            attraction.rating = candidate.rating;
            attraction.types = candidate.types;
            attraction.latitude = candidate.geometry.lat;
            attraction.longitude = candidate.geometry.lng;
            attraction.ratingCount = candidate.user_ratings_total;
            for (let index = 0; index < placesResponse.length; index++) {
                if (placesResponse[index]._id === candidate.place_id) {
                    attraction.rating = placesResponse[index]._source.averageRating;
                    attraction.ratingCount = placesResponse[index]._source.ratingCount;
                    break;
                }
            }
            if (candidate.photos && candidate.photos.length > 0) {
                attraction.photoReference = candidate.photos[0].photo_reference;
                attraction.imageLink = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${attraction.photoReference}&key=AIzaSyCCGb_0fod9vxW27A5iuYwNbW_x2JiCAvc`;
            }
            results.push(attraction);
        });

        return results;

    }

}
