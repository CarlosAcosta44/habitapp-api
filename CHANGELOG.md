# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.4.0](https://dev.azure.com/HabitAppOrg/HabitApp/_git/HabitAppBackend/compare/v1.3.0...v1.4.0) (2026-09-22)


### Features

* **community:** add specialties mapping and fix report period metrics ([67b8ab9](https://dev.azure.com/HabitAppOrg/HabitApp/_git/HabitAppBackend/commit/67b8ab973e71cea7574858946c934d0d6430f421))

## [1.3.0](https://dev.azure.com/HabitAppOrg/HabitApp/_git/HabitAppBackend/compare/v1.2.0...v1.3.0) (2026-09-17)


### Features

* correct streak logic, update records calculation, fix auth constraints ([3f0b27a](https://dev.azure.com/HabitAppOrg/HabitApp/_git/HabitAppBackend/commit/3f0b27a8b3faffc6896b82c37b2d07d22d1bbadc))


### Bug Fixes

* add cache cleanup to start:dev script to prevent module not found errors locally ([3f9a52d](https://dev.azure.com/HabitAppOrg/HabitApp/_git/HabitAppBackend/commit/3f9a52d33e8fd4699ef6e077eef5ef8fa9fc2fe1))
* add postinstall script to build for azure ([55f4c63](https://dev.azure.com/HabitAppOrg/HabitApp/_git/HabitAppBackend/commit/55f4c635efa8b03706e98947a55294d6f9c8dcb9))
* delete dist before build, add rimraf, update gitignore ([943e1ac](https://dev.azure.com/HabitAppOrg/HabitApp/_git/HabitAppBackend/commit/943e1ac42f28c38dc35120a19a5fa8d4164404a0))
* explicitly set tsConfigPath to tsconfig.build.json in nest-cli ([7ed22f6](https://dev.azure.com/HabitAppOrg/HabitApp/_git/HabitAppBackend/commit/7ed22f62b0b3042e6c49cdd087e1dfce5e892628))
* move rimraf to dependencies to fix azure postinstall ([fadce4e](https://dev.azure.com/HabitAppOrg/HabitApp/_git/HabitAppBackend/commit/fadce4ee3cd6254b6b085be19b58403fe689aa19))
* **records:** permitir cantidades negativas para restar progreso en habitos ([20955a2](https://dev.azure.com/HabitAppOrg/HabitApp/_git/HabitAppBackend/commit/20955a2f497221546ad12072e06db3b9674759be))
* remove dist from gitignore so azure kudu copies the compiled output ([8b8d982](https://dev.azure.com/HabitAppOrg/HabitApp/_git/HabitAppBackend/commit/8b8d98278ae8d3621820c880cd9e9121d3bc9f2a))
* remove redundant postinstall and clean tsbuildinfo to prevent double-build cache bugs in azure ([ffe7a8c](https://dev.azure.com/HabitAppOrg/HabitApp/_git/HabitAppBackend/commit/ffe7a8c6b5564df8445c86f1e0bebafa99190dc0))
* remove test_upsert.ts to prevent src/ nesting in dist ([4e7b4df](https://dev.azure.com/HabitAppOrg/HabitApp/_git/HabitAppBackend/commit/4e7b4dfe8c848c4c0e0b2e2ace42c9d64be3255f))
* set rootDir to src to prevent nested dist output ([bb8ec82](https://dev.azure.com/HabitAppOrg/HabitApp/_git/HabitAppBackend/commit/bb8ec82c769f946bcd4eaa59d18ad6097d8a1471))

## 1.0.0 (2026-06-29)


### Features

* **admin:** implement admin module for forum moderation ([e45e640](https://github.com/CarlosAcosta44/habitapp-api/commit/e45e6402b03b68ec497a9828e6c19ad337d9c75e))
* **auth:** implement supabase service, jwt strategy and auth guard ([96e2f4a](https://github.com/CarlosAcosta44/habitapp-api/commit/96e2f4aab10d3ca2a26e2d3402fd42a8c3c5eacf))
* **auth:** implementar endpoints de login y registro en swagger para testing ([dd2eab3](https://github.com/CarlosAcosta44/habitapp-api/commit/dd2eab3dcfc9f9dd140441c7cb591c0791b8a934))
* **coach:** implement coach module and get clients endpoint ([1e1a08b](https://github.com/CarlosAcosta44/habitapp-api/commit/1e1a08bfe874ef7a204e7b831b5f18fb60c8ea8a))
* **coach:** implement routine assignment to clients ([9097bfa](https://github.com/CarlosAcosta44/habitapp-api/commit/9097bfa5181a2e61801734e6d5726f3483bd46da))
* **coach:** implement routine CRUD and nested routine habits ([0fddff5](https://github.com/CarlosAcosta44/habitapp-api/commit/0fddff501ab47d9fcea99c6e32159ed27d59e016))
* **coach:** integrate reports module to track client progress ([59960d4](https://github.com/CarlosAcosta44/habitapp-api/commit/59960d4063cfd22f0a0d1d5a7a15d1c0b149e254))
* **health:** add healthcheck endpoint and swagger integration ([2bd5881](https://github.com/CarlosAcosta44/habitapp-api/commit/2bd5881ff97380322a4801b5bf3e52eba24f1dd5))
* **monitoring:** setup sentry error tracking and add debug-sentry endpoint ([33a68bc](https://github.com/CarlosAcosta44/habitapp-api/commit/33a68bc9450431f18b4e7f9cade326473bc39d93))
* **notifications:** implementar modulo de notificaciones backend y email via Resend ([814487c](https://github.com/CarlosAcosta44/habitapp-api/commit/814487c510884288f4dcad5ea3030e13beaced29))
* **openapi:** add openapi v1 contract with full swagger decorators and yaml snapshot ([d5b2374](https://github.com/CarlosAcosta44/habitapp-api/commit/d5b2374d74a53ca077aad94a5b34097fe5823927))
* **reports:** implementar endpoint de ranking con cache ([b2f4c79](https://github.com/CarlosAcosta44/habitapp-api/commit/b2f4c79c8f23e415f2020beff9646af8e62f6f61))
* **reports:** implementar endpoint resumen usuario via rpc ([8c7af38](https://github.com/CarlosAcosta44/habitapp-api/commit/8c7af38f0fa9d9a26637e6454b2e964a661df0c6))
* **security:** implementar helmet y rate limiting con throttler ([a98badf](https://github.com/CarlosAcosta44/habitapp-api/commit/a98badfd4bf870dc8672eae63a493096fe9c2857))
* **supabase:** versionar migraciones cli y completar politicas rls ([91c1f2b](https://github.com/CarlosAcosta44/habitapp-api/commit/91c1f2b5b9e20ea19d2fa1baeb63e85bc195d6cb))
* **swagger:** reorganizar documentacion y mover endpoints de admin ([b34e8a4](https://github.com/CarlosAcosta44/habitapp-api/commit/b34e8a4d92975029695e9ff28ab3af238b8501d2))
* **users:** completar modulo users v0.1 con repository y endpoints admin ([6235fa7](https://github.com/CarlosAcosta44/habitapp-api/commit/6235fa7fda8612a109fe16684e7a82e8681b3a69))
* **users:** implement users profile module with dto and endpoints ([2a0c962](https://github.com/CarlosAcosta44/habitapp-api/commit/2a0c9629eca77a01894f18cf687ff94b08b21c89))
* **users:** trasladar modulo de usuarios al repo correcto ([53d4748](https://github.com/CarlosAcosta44/habitapp-api/commit/53d4748f8714b9d5898132a7797cb3da3b6d3409))


### Bug Fixes

* **admin:** corregir tablas y esquemas para la eliminacion de foros y comentarios ([737d36d](https://github.com/CarlosAcosta44/habitapp-api/commit/737d36d6c634a74661a56f1bc139c4bb5f0e4ade))
* **auth:** update auth guard schema, remove passport-jwt, add docs ([f208c7a](https://github.com/CarlosAcosta44/habitapp-api/commit/f208c7ad22c04508e6a2b46101a272c9ee75c987))
* **backend:** delete subscriptions in cascades for forums and replace missing RPC with manual TS implementation ([4eda174](https://github.com/CarlosAcosta44/habitapp-api/commit/4eda1745d0c48a477ff28a9b413358e6db854fa4))
* **coach:** add explicit type to routineHabit in assignRoutineToClient ([0b20b67](https://github.com/CarlosAcosta44/habitapp-api/commit/0b20b677585a2307acf6861f9ce7b357958425af))
* **coach:** cascade delete routine assignments when deleting a routine ([d31a17b](https://github.com/CarlosAcosta44/habitapp-api/commit/d31a17bbcdcbc8fae70ef0a966a6c4dbe379c7ca))
* **coach:** resolve trainerId from userId dynamically to match DB schema ([08b7e18](https://github.com/CarlosAcosta44/habitapp-api/commit/08b7e181dd0a50fdf48ff1f4583d68fa427a1970))
* **db:** alinear backend con esquemas en espanol de la base de datos real (gestion, seguimiento, comunidad) y borrar en cascada foros ([fec42d2](https://github.com/CarlosAcosta44/habitapp-api/commit/fec42d2d8a6405b3625fe7bb0f7da4bc17cd7f35))
* **tests:** resolve failing admin and coach service unit tests ([14547cf](https://github.com/CarlosAcosta44/habitapp-api/commit/14547cfc036b81871b06d753bdb8cc21a496bf11))
* **users:** restore UserRole and UpdateUserProfileDto for dependent modules ([44c391a](https://github.com/CarlosAcosta44/habitapp-api/commit/44c391a50cdae50b417f0d6cbd3f0a7f864e1af4))
