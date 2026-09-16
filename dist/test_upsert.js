"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const records_repository_1 = require("./src/records/repositories/records.repository");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const recordsRepo = app.get(records_repository_1.RecordsRepository);
    const userId = '0fc906ba-c6ac-4cf7-b33b-624cbed8d27f';
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
        const res1 = await recordsRepo.marcarCompletado({ idhabito, idusuario: userId, fecha, metaDiaria: hab.meta_diaria });
        console.log(res1);
        console.log("2. Desmarcar:");
        const res2 = await recordsRepo.desmarcarCompletado(idhabito, userId);
        console.log(res2);
        console.log("3. Volver a marcar:");
        const res3 = await recordsRepo.marcarCompletado({ idhabito, idusuario: userId, fecha, metaDiaria: hab.meta_diaria });
        console.log(res3);
        console.log("4. Volver a desmarcar:");
        const res4 = await recordsRepo.desmarcarCompletado(idhabito, userId);
        console.log(res4);
    }
    catch (e) {
        console.error("ERROR:", e);
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=test_upsert.js.map