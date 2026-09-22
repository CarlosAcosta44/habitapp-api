import { QuotesRepository } from '../repositories/quotes.repository';
export declare class QuotesService {
    private readonly quotesRepository;
    constructor(quotesRepository: QuotesRepository);
    getDailyQuote(): Promise<any>;
}
