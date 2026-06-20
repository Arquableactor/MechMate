# Proyecto: Ecosistema AutoMecánica

Contexto permanente para Claude Code. Léelo al inicio de cada sesión y respétalo.
Si algo aquí choca con un prompt puntual, **pregunta antes de romper una regla no negociable.**

## Qué es

Ecosistema "una plataforma, varias apps" para el sector automotriz en **República Dominicana**:
ERP/CRM para mecánicos + marketplace de repuestos + (futuro) courier. El backend y el web son un
**monolito modular en TypeScript**; el móvil es **Flutter (Dart)** que consume ese backend. El
objetivo de este sprint es un **demo vendible** que corre de punta a punta, pulido hasta el límite
de los servicios externos (que quedan mockeados).

## Stack (decidido — no re-litigar)

- Monorepo: **Turborepo + pnpm**.
- Backend: **NestJS** (TypeScript, REST + OpenAPI).
- Móvil: **Flutter (Dart)** — se agrega en Día 8. Consume la API vía **modelos Dart generados
  desde el OpenAPI** del backend (no se mantienen a mano). Proyecto Flutter propio, fuera del
  workspace pnpm/Turborepo, con su toolchain (`flutter`).
- Web: **Next.js** — se agrega en Día 12.
- DB: **PostgreSQL** en **Neon**, ORM/migraciones con **Prisma**.
- Auth: **Auth0**. Pagos: **CardNet** (RD), delegados 100% (nunca tocamos el PAN).
- Caché/colas: **Redis + BullMQ**. Blobs: **Cloudflare R2**.
- Infra: **Render**. Errores: **Sentry**. APM: Datadog.

## Arquitectura — no negociables

1. **Monolito modular con fronteras estrictas.** Cada módulo es dueño de sus tablas.
   **Prohibido SQL cruzado entre módulos** — se cruzan por IDs vía la capa de aplicación.
2. **Ledger de doble entrada** desde la primera transacción. Invariante duro:
   `SUM(ledger_postings.amount_cents) = 0` por `entry_id`. El ledger es **inmutable**
   (correcciones por asiento de reversa, nunca UPDATE/DELETE). Esto es lo que un comprador
   técnico auditará primero — no mejora "después".
3. **Pagos detrás de la interfaz `PaymentProvider`.** CardNet es un adapter. Cambiar de PSP no
   debe reescribir el dominio.
4. **Outbox transaccional:** eventos de dominio se escriben en la **misma transacción** que el
   cambio de estado; un worker BullMQ los publica.
5. **Identidad multi-rol:** una cuenta, múltiples roles (mechanic|seller|customer|courier|admin).
   No una tabla de usuarios por app.
6. **Idempotencia obligatoria** (`Idempotency-Key`) en todo endpoint de escritura con pago.

## Convenciones de código

- **api/web (TypeScript):** `strict`, sin `any` salvo justificación.
- **móvil (Flutter/Dart):** seguir `effective_dart`/lints estándar; los modelos del contrato de API
  se **generan desde el OpenAPI** (p. ej. `openapi-generator` → Dart), no se escriben a mano.
- DB: `snake_case`; PKs `uuid` v7 (ordenable por tiempo); `created_at`/`updated_at` en toda tabla.
- **Dinero en enteros (centavos)** + `currency`. **Nunca floats para dinero.**
- API REST versionada `/v1`; OpenAPI autogenerado por NestJS (es el contrato que alimenta al móvil).
- Multi-tenant por `shop_id`/`seller_id` donde aplique, desde el inicio.
- Secrets en variables de entorno, **nunca** commiteados. Hay `.env.example`, no `.env`.
- Tests junto al código; cada tarea trae sus propios tests.

## Externos: mockear en la interfaz

CardNet, WhatsApp Business API y el catálogo TecDoc completo **NO** se integran en productivo en
este sprint. Se construye el adapter/interface y se corre en **sandbox o mock**. El comprador
enchufa sus credenciales reales después. Diseña esos límites como costuras limpias.

## Qué NO construir

- **Courier (Fase 3):** solo dejar **reservados** los eventos (`DeliveryRequested`,
  `CourierAssigned`, `DeliveryInTransit`, `DeliveryCompleted`) y la línea de ledger. **No** se
  implementa lógica de courier.
- **Nada de microservicios, Kafka, ni sharding.** Es monolito modular sobre un Postgres.
- No agregues dependencias pesadas sin justificarlo.

## Estructura del repo (objetivo)

```
/
├─ apps/
│  ├─ api/         # NestJS — workspace pnpm (existe desde Día 1)
│  ├─ web/         # Next.js — workspace pnpm (Día 12)
│  └─ mobile/      # Flutter (Dart) — proyecto Flutter propio, FUERA del workspace pnpm (Día 8)
├─ packages/
│  ├─ types/       # tipos compartidos TS (api + web)
│  └─ config/      # eslint, tsconfig base compartidos (api + web)
├─ turbo.json      # orquesta api/web/packages (no el móvil Flutter)
├─ pnpm-workspace.yaml
└─ CLAUDE.md
```

## Comandos

- `pnpm install` — instalar el workspace TS (api/web/packages).
- `pnpm build` / `pnpm test` / `pnpm lint` — vía Turborepo, incrementales.
- `pnpm --filter api dev` — levantar el backend en local.
- Migraciones: `pnpm --filter api prisma migrate dev`.
- Móvil (desde `apps/mobile`): `flutter pub get`, `flutter run`, `flutter test`,
  `flutter build apk|ios`. Regenerar modelos del contrato tras cambios en el OpenAPI.

## Forma de trabajo (Code Agency)

- **Una tarea = una unidad de cambio** (1 archivo nuevo + 0–3 modificados, o un grupo que cambia
  por una sola razón). Si una tarea toca 10+ archivos, está mal descompuesta — pregúntame.
- **Propón un plan antes de escribir código** (usa plan mode). Espera el OK.
- Cada tarea tiene **criterio de aceptación binario** verificable con un comando.
- Commits estilo **Conventional Commits** (`feat:`, `fix:`, `chore:`, `test:`, `docs:`...).
- **No apruebes nada con tests rojos.** Falla cerrada.

## Referencias

- Roadmap del sprint: `docs/Roadmap-15-dias-scope-completo.md`
- Decisiones: ADR-001 (monolito modular), ADR-002 (plataforma + apps)
- Spec técnico completo (modelo de datos, contratos API, eventos de dominio)
