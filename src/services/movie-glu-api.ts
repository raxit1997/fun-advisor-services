import 'reflect-metadata';
import { Service } from 'typedi';
import { get } from 'request';

@Service('movie.glu.api')
export class MovieGluAPI {

    constructor() { }

}