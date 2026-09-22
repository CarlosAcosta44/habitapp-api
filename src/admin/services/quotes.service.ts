import { Injectable } from '@nestjs/common';
import { QuotesRepository } from '../repositories/quotes.repository';

@Injectable()
export class QuotesService {
  constructor(private readonly quotesRepository: QuotesRepository) {}

  async getDailyQuote() {
    const data = await this.quotesRepository.getAllQuotes();
    if (!data || data.length === 0) {
      return { phrase: 'Cada día es una nueva oportunidad.', author: 'HabitApp' };
    }
    
    // Determinar la frase del día usando la fecha actual (día del año) para que rote
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    const index = dayOfYear % data.length;
    return data[index];
  }
}
