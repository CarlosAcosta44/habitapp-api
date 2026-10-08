# Arquitectura Backend NestJS

Este backend sigue una adaptación de **Clean Architecture** y **Feature Modules**.

## Flujo Estricto de 6 Capas
Cada módulo de negocio debe tener exactamente estas 6 carpetas:
1. **`controllers/`**: Capa HTTP. Recibe JSON, valida con DTOs, revisa tokens.
2. **`services/`**: Lógica de negocio.
3. **`interfaces/`**: Contratos de Inversión de Dependencias (Dependency Injection).
4. **`repositories/`**: La única capa autorizada para usar Supabase.
5. **`entities/`**: Tipos puros de TypeScript que representan el modelo.
6. **`dto/`**: Clases con `class-validator` y Swagger.

## Regla de Oro
Ningún `Controller` ni `Service` puede importar `SupabaseService`. Si necesitas datos, obligatoriamente debes pedirselos al `Repository` a través de su `Interface`. Esto garantiza un código 100% testeable.
