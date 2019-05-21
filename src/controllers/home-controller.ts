import { Controller, Get, Post, Req, Res, Body } from 'routing-controllers';
import { Service, Inject } from 'typedi';
import { ElasticSearch } from '../services/elastic-search';

@Service()
@Controller()
export class HomeController {

    constructor(@Inject('elastic.search') private elasticSearch: ElasticSearch) { }

    @Get('/hello')
    async getData(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            res.json({ isSuccess: true });
        } catch (error) {
            return { isSuccess: false };
        }
    }

    @Post('/:indexName/:mappingName')
    async addData(@Req() req: any, @Res() res: any, @Body() body: any): Promise<any> {
        try {
            
        } catch (error) {

        }
    }
}
