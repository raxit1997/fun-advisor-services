import { Controller, Get, Req, Res, Body } from 'routing-controllers';
import { Service, Inject } from 'typedi';
import { ResponseUtility } from '../utils/response-utility';
import { GoogleMapsAPI } from '../services/di.config';
import { Shop } from '../models/Shops/Shop';
import { CancellationError } from 'bluebird';

@Service()
@Controller()
export class ShoppingController {

    responseUtility: ResponseUtility;

    constructor(@Inject('google.maps.api') private googleMapsAPI: GoogleMapsAPI) {
        this.responseUtility = new ResponseUtility();
    }



    @Get('/shopResults/:text')
    async searchShops(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let latitude = req.headers.latitude;
            let longitude = req.headers.longitude;
            let queryString = req.params.text;
            let requestURL = `https://maps.googleapis.com/maps/api/place/textsearch/json?key=AIzaSyCCGb_0fod9vxW27A5iuYwNbW_x2JiCAvc&query=${queryString}`;
            let response: any = await this.googleMapsAPI.fetchData(requestURL);
            let token = response.next_page_token;
            let result = this.retrieveShopResults(response);
            return this.responseUtility.generateResponse(true, { results: result, token: token });
        } catch (err) {
            return { isSuccess: false };
        }

    }


    private retrieveShopResults(response: any) {
        let results: Shop[] = new Array<Shop>();;
        let candidates = response.results;
        candidates.forEach((candidate: any) => {
                let shop = new Shop();
                shop.name = candidate.name;
                shop.address = candidate.formatted_address;
                shop.openNow = candidate.opening_hours ? candidate.opening_hours.open_now : 'NA';
                shop.placeId = candidate.place_id;
                shop.rating = candidate.rating;
                shop.types = candidate.types;
                shop.latitude = candidate.geometry.lat;
                shop.longitude = candidate.geometry.lng;
                if (candidate.photos && candidate.photos.length > 0) {
                    shop.photoReference = candidate.photos[0].photo_reference;
                    shop.imageLink = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${shop.photoReference}&key=AIzaSyCCGb_0fod9vxW27A5iuYwNbW_x2JiCAvc`;
                }
                results.push(shop);
        });

        return results;

    }

    private retrieveShopSearch(response: any) {
        let result: Shop[] = new Array<Shop>();;
        let candidates = response.candidates;
        if (candidates.length > 0 && (candidates[0].types.indexOf('store') != -1 || candidates[0].types.indexOf('shopping_mall') != -1)) {
            let candidate = candidates[0];
            let shop = new Shop();
            shop.name = candidate.name;
            shop.address = candidate.formatted_address;
            shop.openNow = candidate.opening_hours.open_now;
            shop.placeId = candidate.place_id;
            shop.rating = candidate.rating;
            shop.types = candidate.types;
            if (candidate.photos && candidate.photos.length > 0) {
                shop.photoReference = candidate.photos[0].photo_reference
            }
            result.push(shop);
        }
        return result;

    }

}
