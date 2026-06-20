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
| `pnpm --filter api prisma migrate dev --name init` | Aplica la migración inicial contra Neon |

## API

- Base: `http://localhost:3000/v1`
- Health: `GET /v1/health` → `200`
  ```json
  { "status": "ok", "uptime": 12.3, "timestamp": "2026-06-20T12:00:00.000Z", "db": "up" }
  ```
  `db` es `"up"` si el `SELECT 1` contra Postgres responde, `"down"` si no hay DB configurada
  (el endpoint no se cae: degrada con elegancia).
- OpenAPI (Swagger UI): `GET /v1/docs`

## Base de datos (Neon + Prisma)

1. Crea una base en [Neon](https://neon.tech) y copia la connection string a `apps/api/.env`.
2. Aplica la migración inicial:
   ```bash
   pnpm --filter api prisma migrate dev --name init
   ```
   Crea la tabla trivial `_healthcheck` (PK `uuid` v7, `created_at timestamptz`).
3. Verifica: `curl localhost:3000/v1/health` debe responder `"db": "up"`.

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
