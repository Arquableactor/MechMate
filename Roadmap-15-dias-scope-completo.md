# Roadmap — 15 días (120 h) · SCOPE COMPLETO

**Proyecto:** Ecosistema AutoMecánica
**Objetivo:** app **construida para venderse a un comprador** — demo que corre de punta a punta, pulida hasta el límite de los externos
**Capacidad:** 15 días × 8 h = **120 h**
**Flow:** Code Agency (humano-bus + Claude eng-lead + Qwen3 vía Continue)
**Reemplaza:** `Roadmap-MVP-15-dias.md` (versión mínima)
**Fecha:** 2026-06-20

---

## 0. Alcance: qué significa "todo" en 120 h

**Entra (amplitud comprometida):**
- **Fase 0** completa: monorepo, identidad multi-rol (Auth0), Payments+Ledger con CardNet (sandbox/mock), outbox+worker, mensajería (push+email; WhatsApp stub), observabilidad.
- **Fase 1 ERP mecánicos**: núcleo que cobra — taller/mecánicos, clientes+vehículos por VIN, órdenes de trabajo, DVI con fotos + aprobación, facturación, cobro con comisión vía ledger, notificaciones, historial.
- **Fase 2 Marketplace (slice funcional)**: catálogo + **fitment por VIN**, alta de repuestero, listings + carga masiva, carrito + checkout con escrow contra el ledger, y el **flujo killer** (comprar la pieza desde la orden de trabajo).

**Reservado, NO construido:**
- **Courier (Fase 3):** solo eventos de dominio + línea de ledger reservados. Todos los ADR lo dejan como enchufe futuro. Construirlo NO cabe en 15 días.

**Mockeado en el límite (lo enchufa el comprador):**
- CardNet (KYC productivo + credenciales reales) · WhatsApp Business API · catálogo TecDoc completo.

**Decisiones ya cerradas:** delegar pagos 100 % · RD + CardNet · Auth0 · Prisma · Render + Neon · **móvil en Flutter (Dart)**.

**Honestidad de capacidad:** a esta amplitud, nada queda gold-plated. El demo corre completo; el pulido fino baja. El buffer (Día 15) es lo primero que se sacrifica. Amplitud sobre profundidad — elección consciente para vender.

---

## 1. DÍA 0 — Pre-trabajo (provisión, no consume horas de código)

- [ ] Repo GitHub + branch protection + CI vacía.
- [ ] Cuentas: Auth0, Render, Neon (PITR), Redis, Cloudflare R2, Sentry.
- [ ] CardNet: pedir credenciales **sandbox**; el adapter se construye contra su API, mock donde no haya sandbox. KYC productivo → lo completa el comprador.
- [ ] WhatsApp: queda **stub**; lo enciende el comprador.
- [ ] (Sin taller piloto: build-to-sell → demo con datos sembrados.)

---

## 2. FASE 0 — Fundación transversal (Días 1–3)

> Apretada a 3 días para abrir espacio al marketplace. Es la base de todo: no se recorta.

### Día 1 — Esqueleto + pipeline
- [ ] Monorepo Turborepo + pnpm; `packages/` de tipos compartidos.
- [ ] App NestJS base (REST + OpenAPI).
- [ ] CI GitHub Actions: lint + test + build.
- [ ] Prisma + conexión a Neon; tooling de migraciones.
- [ ] Deploy "hello" a Render → **prueba el pipeline end-to-end**.
- [ ] Reservar en el contrato de outbox los eventos de courier (placeholder, sin lógica).

### Día 2 — Identity (Auth0, una cuenta + roles)
- [ ] Integrar Auth0 (login, social, MFA del proveedor).
- [ ] Tablas `accounts`, `account_roles`, `shops`.
- [ ] `/v1/auth/register`, `/v1/auth/login`, `/v1/me`, `/v1/me/roles`.
- [ ] Verificable: una cuenta con rol mechanic + customer + seller sin re-registro.

### Día 3 — Payments+Ledger + Outbox + Messaging (día denso ⚠️)
- [ ] Tablas `ledger_accounts/entries/postings`, `payments`, `payouts`.
- [ ] Interfaz `PaymentProvider` + adapter **CardNet** (sandbox/mock).
- [ ] Invariante `SUM(postings)=0` por entry + idempotencia (`Idempotency-Key`).
- [ ] `outbox` en misma tx + worker BullMQ + Redis.
- [ ] Messaging: push + email con `messages`/`status`/retry (WhatsApp stub).
- [ ] Sentry + health checks + backups PITR confirmados.

---

## 3. FASE 1 — ERP mecánicos (Días 4–8)

### Día 4 — Talleres, clientes, vehículos
- [ ] Alta `shops` + mecánicos con roles.
- [ ] `vehicles` + **decode de VIN** (NHTSA vPIC / asistido).
- [ ] Endpoints cliente y vehículo.

### Día 5 — Órdenes de trabajo
- [ ] `work_orders` + `work_order_items` (labor|part); estados; total.
- [ ] `/v1/workorders` (crear, leer).

### Día 6 — DVI + aprobación
- [ ] `inspections`; fotos → R2 con URLs firmadas; `findings` JSON.
- [ ] `/v1/workorders/:id/dvi` y `/approve` (link/OTP) disparado por messaging.

### Día 7 — Facturación + cobro (flujo del dinero)
- [ ] `/v1/workorders/:id/charge` (Idempotency-Key) → Payments → Ledger.
- [ ] Asientos: cobro + comisión + disponible + `payout` agendado al taller.
- [ ] Historial por vehículo y cliente.

### Día 8 — App móvil (Flutter / Dart)
- [ ] Generar el cliente/modelos Dart desde el **OpenAPI** del backend (no a mano).
- [ ] Cablear flujo ERP núcleo: onboard → cliente/vehículo → orden → DVI → aprobar → cobrar → notificar.
- [ ] ⚠️ Niceties post-MVP (agenda, inventario, reportería) = **stretch**, solo si sobra.

---

## 4. FASE 2 — Marketplace, slice funcional (Días 9–12)

### Día 9 — Catálogo + Fitment (lo pesado)
- [ ] `products`, `fitments`, `part_cross_refs`.
- [ ] Búsqueda por **VIN** y año-marca-modelo (Postgres FTS al inicio).
- [ ] `/v1/fitment/decode`, `/v1/parts`.

### Día 10 — Vendedor (repuestero)
- [ ] `listings`, `inventory`; alta con KYC (mock) y reputación inicial.
- [ ] Publicación + carga masiva CSV; `/v1/seller/listings` (+`/bulk`).

### Día 11 — Comprador + escrow
- [ ] `cart`, `orders`, `order_items`; checkout con **escrow contra el ledger** (Idempotency-Key).
- [ ] Liberación de escrow por confirmación manual del comprador (sin courier).
- [ ] `/v1/orders` (crear, leer, return).

### Día 12 — Flujo killer + web del marketplace
- [ ] **Puente ERP→Marketplace:** comprar la pieza desde la orden con el VIN ya capturado.
- [ ] `orders.source_workorder_id` ↔ `work_order_items.marketplace_order_item_id`.
- [ ] Web Next.js mínima del marketplace para el demo (catálogo + checkout).

---

## 5. Integración, demo y endurecimiento (Días 13–14)

### Día 13 — End-to-end + hardening
- [ ] Recorrer el **ciclo completo**: mecánico → pieza (fitment VIN) → pago → comisión → escrow.
- [ ] Reconciliación del ledger (`SUM(postings)=0`); idempotencia (doble click no cobra doble).
- [ ] Errores, backoff, circuit breaker en CardNet/WhatsApp, rate limiting.
- [ ] **Review de seguridad MANUAL.** ⚠️ Skills `code-reviewer`/`cybersec-analyst` no existen en F1 → manual + deuda registrada para F2.

### Día 14 — Paquete de venta
- [ ] Datos **sembrados** para demo realista.
- [ ] Deploy con feature flags; smoke tests; dashboards (p95, error rate, colas).
- [ ] **Handoff doc:** cómo enchufar CardNet/WhatsApp reales + guion de demo del flujo killer.

---

## 6. Día 15 — Buffer (no opcional)
- [ ] Colchón; pulir lo que el recorrido destape.
- [ ] Release notes + bitácora.
- [ ] Primer sacrificio si el tiempo se acaba antes.

---

## 7. Riesgos y palanca de scope

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Amplitud > tiempo | Pulido baja, buffer muere | Scope ya asume broad-over-deep; ladder de recorte abajo |
| 2 superficies UI (Flutter + Next) | La más tensa; son 2 paradigmas distintos | Demo funcional primero; pulido visual al final; cliente Dart generado del OpenAPI |
| Fitment (Día 9) más caro de lo esperado | Atrasa marketplace | FTS de Postgres, no Typesense aún; catálogo seed pequeño |
| Día 3 sobrecargado | Fundación frágil | Si se desborda, robar del buffer, nunca del ledger |
| Sin review/QA automatizada (F1) | Menor aseguramiento | Review manual + deuda F2 |

**Orden de recorte (si falta tiempo):** niceties ERP (agenda/inventario/reportería) → pulido web marketplace → carga masiva CSV → carga seed de catálogo amplia.
**Nunca se recorta:** ledger, cobro, **flujo killer**, escrow, reconciliación, idempotencia.

---

## 8. Siguiente paso del flow

Bajar el **Día 1 a SPECs atómicos** (1 archivo nuevo + 0–3 modificados, criterio binario) y rutear a `programmer-router` → Qwen3.

Candidato a `SPEC_001`: *scaffold monorepo Turborepo + NestJS base + CI verde + deploy hello a Render*.
