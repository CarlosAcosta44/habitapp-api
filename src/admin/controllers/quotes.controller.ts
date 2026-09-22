import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QuotesService } from '../services/quotes.service';

@ApiTags('quotes')
@Controller('admin/quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Obtener la frase motivacional del día' })
  @ApiResponse({ status: 200, description: 'Frase del día retornada exitosamente.' })
  getDailyQuote() {
    return this.quotesService.getDailyQuote();
  }
}
