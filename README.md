# Ecosistema AutoMecánica

Monorepo TypeScript (Turborepo + pnpm) del Ecosistema AutoMecánica. Esta es la **fundación
(Día 1)**: backend NestJS con health check, Prisma → Postgres (Neon), CI y deploy a Render.
El dominio (auth, pagos, ledger, marketplace, móvil Flutter) llega en días siguientes — ver
[`Roadmap-15-dias-scope-completo.md`](./Roadmap-15-dias-scope-completo.md) y [`CLAUDE.md`](./CLAUDE.md).

## Estructura

```
apps/
  api/        # NestJS (REST + OpenAPI) — workspace pnpm
packages/
  types/      # tipos compartidos TS (@repo/types)
  config/     # tsconfig base + ESLint + Prettier compartidos (@repo/config)
```

El móvil (Flutter) y la web (Next.js) se agregan después; el móvil vive fuera del workspace pnpm.

## Requisitos

- Node.js ≥ 20
- pnpm (vía Corepack: `corepack enable`)

## Setup

```bash
corepack enable          # activa pnpm
pnpm install             # instala todo el workspace
cp .env.example apps/api/.env   # configura DATABASE_URL y PORT
```

Prisma lee `apps/api/.env` cuando corres comandos con `--filter api`.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Levanta todo en modo dev (incluye el API) |
| `pnpm --filter api dev` | Levanta solo el backend en local |
| `pnpm build` | Build incremental de todo el workspace (Turborepo) |
| `pnpm test` | Tests de todo el workspace |
| `pnpm lint` | Lint de todo el workspace |
| `pnpm --filter api exec prisma migrate deploy` | Aplica las migraciones contra Neon (citext + tablas) |

## API

- Base: `http://localhost:3000/v1`
- Health: `GET /v1/health` → `200`
  ```json
  { "status": "ok", "uptime": 12.3, "timestamp": "2026-06-20T12:00:00.000Z", "db": "up" }
  ```
  `db` es `"up"` si el `SELECT 1` contra Postgres responde, `"down"` si no hay DB configurada
  (el endpoint no se cae: degrada con elegancia).
- OpenAPI (Swagger UI): `GET /v1/docs`

### Identity (Día 2)

Auth0 es dueño de las credenciales; la API solo valida el **JWT** (RS256). Los roles viven en la DB.

- `GET /v1/me` — perfil + roles del token actual. **Provisiona** la cuenta (JIT) en la primera llamada.
- `POST /v1/me/roles` `{ "role": "mechanic" }` — añade rol a la cuenta. Idempotente. Solo acepta
  `mechanic|seller|customer` (rechaza `courier|admin` con `400`).

Ambos requieren `Authorization: Bearer <token>`. Sin token / inválido ⇒ `401`.

#### Obtener un token de prueba de Auth0

1. En el dashboard de Auth0, abre tu **API** → pestaña **Test**. Auth0 muestra un `curl` con un token
   de una app **Machine-to-Machine** (client_credentials) ya autorizada para esa API.
2. Copia el `access_token` y ejercita la API:
   ```bash
   TOKEN="<access_token>"
   curl -s -H "Authorization: Bearer $TOKEN" localhost:3000/v1/me | jq
   curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
     -d '{"role":"mechanic"}' localhost:3000/v1/me/roles | jq
   ```
   Para un token de usuario real (con `email`/`name` en los claims) usa el flujo de Universal Login
   de tu app SPA/móvil; el M2M sirve para validar el guard y el provisioning por `sub`.

### Payments + Ledger (Día 3)

El corazón del sistema: motor de pagos y **ledger de doble entrada**. Invariantes garantizadas en la
DB con triggers (no solo en la app):

- **Doble entrada:** `SUM(ledger_postings.amount_cents) = 0` por asiento (CONSTRAINT TRIGGER diferido,
  valida al COMMIT); un asiento = una sola moneda.
- **Inmutable:** `ledger_entries`/`ledger_postings` son append-only — `UPDATE`/`DELETE`/`TRUNCATE`
  lanzan excepción. Las correcciones se hacen con un **asiento de reversa** (INSERT nuevo).
- **Dinero en BigInt centavos**; en el wire viaja como **string** (`amount_cents: "100000"`) para no
  perder precisión — el cliente hace `BigInt(str)`/`int.parse`, nunca `Number`.
- **Captura idempotente** por `idempotency_key`: reintentar no duplica el pago ni el asiento; misma
  key con payload distinto ⇒ `409`.

La captura postea un asiento de 3 líneas (buyer −total / seller +net / platform +comisión) y escribe
`PaymentCaptured` + `CommissionAccrued` al `outbox` en la misma transacción. (El worker que publica el
outbox y el endpoint de cobro de la orden llegan después.)

#### CardNet (mock) y webhook

Los pagos están detrás de la interfaz `PaymentProvider`; el adapter **CardNet** corre en
sandbox/mock determinista (config por env, ver `CARDNET_*`). El comprador enchufa credenciales reales
después — nunca tocamos el PAN.

- `POST /v1/payments/webhook/:provider` — público; lo autentica la **firma HMAC** sobre el cuerpo
  crudo (header `x-signature`), no un JWT. Firma inválida ⇒ `401`.

## Base de datos (Neon + Prisma)

1. Crea una base en [Neon](https://neon.tech) y copia la connection string a `apps/api/.env`
   (junto con las vars `AUTH0_*`, ver [`.env.example`](./.env.example)).
2. Aplica las migraciones:
   ```bash
   pnpm --filter api exec prisma migrate deploy
   ```
   Crea la extensión `citext`, Identity (`accounts`, `account_roles`, `shops`) y el motor de pagos
   (`ledger_accounts`, `ledger_entries`, `ledger_postings`, `payments`, `payouts`, `outbox`) con sus
   triggers de balance e inmutabilidad y las cuentas singleton de plataforma/impuestos.

   > **Usa `migrate deploy`, no `migrate dev`.** Las migraciones llevan SQL crudo que Prisma no modela
   > (triggers, `citext`, `UNIQUE ... NULLS NOT DISTINCT`). `migrate dev` detectaría "drift" e
   > intentaría revertir esos objetos — preserva las migraciones a mano.
3. Verifica: `curl localhost:3000/v1/health` debe responder `"db": "up"`.

### Tests

```bash
pnpm --filter api test:unit   # rápidos, Prisma mockeado
pnpm --filter api test:int    # integración: triggers del ledger contra Postgres REAL
pnpm --filter api test        # ambos
```

Los tests de integración necesitan Postgres real: en local se levanta **embedded-postgres** (binario
real vía npm, sin Docker) automáticamente; en CI se usa un service container y `TEST_DATABASE_URL`.

## Deploy a Render

El deploy usa [`render.yaml`](./render.yaml) (runtime nativo Node, sin Docker).

1. Conecta el repo en Render (Blueprint → detecta `render.yaml`).
2. Define el secreto `DATABASE_URL` (Neon) en el dashboard de Render.
3. Render ejecuta: `pnpm install` → `prisma generate` → `pnpm --filter api build` →
   `prisma migrate deploy`, y arranca con `pnpm --filter api start:prod`.

### Smoke test del deploy

```bash
curl -s https://<tu-servicio>.onrender.com/v1/health | jq
# Esperado: { "status": "ok", "uptime": <n>, "timestamp": "...", "db": "up" }
```

Render también usa `GET /v1/health` como `healthCheckPath`.

## CI

[`.github/workflows/ci.yml`](./.github/workflows/ci.yml) corre en cada push y PR:
`pnpm install` → `pnpm lint` → `pnpm test` → `pnpm build`, con caché de pnpm y Turborepo.
