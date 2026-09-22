import { Module } from '@nestjs/common';
import { ComunidadController } from './comunidad.controller';
import { ComunidadService } from './comunidad.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ComunidadController],
  providers: [ComunidadService]
})
export class ComunidadModule {}
