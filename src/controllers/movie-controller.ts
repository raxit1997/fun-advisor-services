import { Controller, Get, Req, Res, Body } from 'routing-controllers';
import { Service, Inject } from 'typedi';
import { MovieGluAPI } from '../services/movie-glu-api';
import { ResponseUtility } from '../utils/response-utility';
import { MovieDelegate } from '../delegates/movieDelegate';

@Service()
@Controller()
export class MovieController {

    responseUtility: ResponseUtility;
    movieDelegate: MovieDelegate;

    constructor(@Inject('movie.glu.api') private movieGlu: MovieGluAPI) {
        this.responseUtility = new ResponseUtility();
        this.movieDelegate = new MovieDelegate(movieGlu);
    }

    @Get('/theatres')
    async getTheatres(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let latitude = req.headers.latitude;
            let longitude = req.headers.longitude;
            let response: any = await this.movieDelegate.getTheatres(latitude, longitude);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return { isSuccess: false };
        }
    }

    @Get('/movies')
    async getMovies(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let latitude = req.headers.latitude;
            let longitude = req.headers.longitude;
            let response: any = await this.movieDelegate.getMovies(latitude, longitude);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return { isSuccess: false };
        }
    }


    @Get('/theatresByMovie/:movieId/:date')
    async getTheatresByMovie(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let latitude = req.headers.latitude;
            let longitude = req.headers.longitude;
            let movieId = req.params.movieId
            let date = req.params.date;
            let response: any = await this.movieDelegate.getTheatresByMovie(latitude, longitude, movieId, date);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return { isSuccess: false };
        }
    }


    @Get('/moviesByTheatre/:theatreId/:date')
    async getMoviesByTheatre(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            let latitude = req.headers.latitude;
            let longitude = req.headers.longitude;
            let theatreId = req.params.theatreId
            let date = req.params.date;
            let response: any = await this.movieDelegate.getMoviesByTheatre(latitude, longitude, theatreId, date);
            return this.responseUtility.generateResponse(true, response);
        } catch (error) {
            return { isSuccess: false };
        }
    }







}
