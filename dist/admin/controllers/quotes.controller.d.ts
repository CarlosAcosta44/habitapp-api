import { QuotesService } from '../services/quotes.service';
export declare class QuotesController {
    private readonly quotesService;
    constructor(quotesService: QuotesService);
    getDailyQuote(): Promise<any>;
}
