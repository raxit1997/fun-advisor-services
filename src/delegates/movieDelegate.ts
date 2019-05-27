import { Controller } from 'routing-controllers';
import { Service, Inject } from 'typedi';
import { ZomatoAPI } from '../services/zomato-api';
import { ResponseUtility } from '../utils/response-utility';
import { MovieGluAPI } from '../services/movie-glu-api';
import { Movie } from '../models/movies/Movie';
import { Theatre } from '../models/movies/Theatre';


export class MovieDelegate {

    responseUtility: ResponseUtility;

    constructor(@Inject('movie.glu.api') private movieGlu: MovieGluAPI) {
        this.responseUtility = new ResponseUtility();
    }

    async getMovies(latitude: string, longitude: string) {
        try {
            let response: any = await this.movieGlu.fetchData('filmsNowShowing/?n=20', latitude, longitude);
            let moviesArray: Movie[] = this.populateMovies(response.films);
            return moviesArray;
        } catch (err) {
            return Promise.reject<any>('');
        }
    }

    async getTheatres(latitude: string, longitude: string) {
        try {
            let response: any = await this.movieGlu.fetchData('cinemasNearby/?n=24', latitude, longitude);
            let theatresArray: Theatre[] = this.populateTheatres(response.cinemas);
            return theatresArray;
        } catch (err) {
            return Promise.reject<any>('');
        }
    }

    async getMoviesByTheatre(latitude: string, longitude: string, cinemaId: string, date: string) {
        try {
            let response: any = await this.movieGlu.fetchData(`cinemaShowTimes/?cinema_id=${cinemaId}&date=${date}`, latitude, longitude);
            let moviesArray: Movie[] = this.populateMovies(response.films);
            return moviesArray;
        } catch (err) {
            return Promise.reject<any>('');
        }
    }


    async getTheatresByMovie(latitude: string, longitude: string, movieId: string, date: string) {
        try {
            let response: any = await this.movieGlu.fetchData(`filmShowTimes/?film_id=${movieId}&date=${date}`, latitude, longitude);
            let theatresArray: Theatre[] = this.populateTheatres(response.cinemas);
            return theatresArray;
        } catch (err) {
            return Promise.reject<any>('');
        }
    }


    private populateMovies(films: any): any {
        let moviesArray = new Array<any>();
        films.forEach((element: any) => {
            let movie = new Movie();
            movie.filmId = element.film_id;
            movie.imdbId = element.imdb_id;
            movie.filmName = element.film_name;
            movie.imageLink = element.images.poster[1].medium.film_image;
            movie.trailerLink = element.film_trailer;
            movie.ageRating = element.age_rating.rating;
            moviesArray.push(movie);
        });
        return moviesArray;
    }

    private populateTheatres(theatres: any) {
        let theatresArray = new Array<any>();
        theatres.forEach((element: any) => {
            let theatre = new Theatre();
            theatre.theatreId = element.cinema_id;
            theatre.theatreName = element.cinema_name;
            theatre.address = element.address;
            theatre.city = element.city;
            theatre.postcode = element.postcode;
            theatre.distance = element.distance;
            theatresArray.push(theatre);
        })
        return theatresArray;
    }




}
