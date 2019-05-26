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



    @Get('/shopSearch?:text')
    async searchShops(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let latitude = req.headers.latitude;
            let longitude = req.headers.longitude;
            let queryString = req.query.text;
            let requestURL = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${queryString}&inputtype=textquery&fields=photos,place_id,types,formatted_address,name,opening_hours,rating,price_level&locationbias=point:${latitude},${longitude}&key=AIzaSyCCGb_0fod9vxW27A5iuYwNbW_x2JiCAvc`;
            let response = await this.googleMapsAPI.fetchData(requestURL);
            let result = this.retrieveShopSearch(response);
            return this.responseUtility.generateResponse(true, result);
        } catch (err) {
            return { isSuccess: false };
        }

    }

    private retrieveShopSearch(response: any) {
        let result: Shop[] = new Array<Shop>();;
        let candidates = response.candidates;
        if (candidates.length > 0 && (candidates[0].types.indexOf('store') != -1 || candidates[0].types.indexOf('shopping_mall') != -1 )) {
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
