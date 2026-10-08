# Estructura de Carpetas (Core vs Modules)

El código fuente en `src/` está rigurosamente aislado:

```text
src/
├── core/                            # ⚙️ Infraestructura y herramientas transversales
│   ├── common/                      # Guards (roles, jwt), interceptors, decorators
│   ├── health/                      # Health check endpoints
│   ├── mail/                        # Envío de correos electrónicos (Resend)
│   └── supabase/                    # Conexión técnica a PostgreSQL
│
├── modules/                         # 📦 Dominios de Negocio (Regla de 6 capas)
│   ├── admin/                       
│   ├── auth/                        # Autenticación Custom (JWT, Bcrypt, OAuth Nativo)
│   ├── coach/                       
│   ├── community/                   # Foros, Retos, Artículos y Comentarios
│   ├── habits/                      # CRUD de hábitos, historiales y rachas
│   ├── notifications/               
│   ├── reports/                     
│   └── users/                       
```
Cualquier archivo de configuración, middleware, o utilidad técnica debe ir a `core/`.
