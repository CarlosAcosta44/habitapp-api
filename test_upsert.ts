import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { RecordsRepository } from './src/records/repositories/records.repository';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const recordsRepo = app.get(RecordsRepository);
  
  // Use a hardcoded user and habit from the logs
  const userId = '0fc906ba-c6ac-4cf7-b33b-624cbed8d27f'; // admin user
  const client = app.get('SupabaseService').getClient().schema('seguimiento');
  const { data: hab } = await client.from('habitos').select('idhabito, meta_diaria').eq('idusuario', userId).limit(1).single();
  
  if (!hab) {
    console.log("No habits found");
    return;
  }
  
  const idhabito = hab.idhabito;
  const fecha = new Date().toISOString().split('T')[0];
  console.log("Testing with habit", idhabito, "date", fecha);
  
  try {
    console.log("1. Marcar:");
    const res1 = await recordsRepo.marcarCompletado({idhabito, idusuario: userId, fecha, metaDiaria: hab.meta_diaria});
    console.log(res1);
    
    console.log("2. Desmarcar:");
    const res2 = await recordsRepo.desmarcarCompletado(idhabito, userId);
    console.log(res2);
    
    console.log("3. Volver a marcar:");
    const res3 = await recordsRepo.marcarCompletado({idhabito, idusuario: userId, fecha, metaDiaria: hab.meta_diaria});
    console.log(res3);
    
    console.log("4. Volver a desmarcar:");
    const res4 = await recordsRepo.desmarcarCompletado(idhabito, userId);
    console.log(res4);
  } catch (e) {
    console.error("ERROR:", e);
  }
  
  await app.close();
}
bootstrap();
