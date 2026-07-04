# QuickDrop – Last-Mile Delivery Tracker (Backend)

Node.js / Express / MongoDB API for the delivery management platform.

## Setup

```bash
npm install
cp .env.example .env    # fill in MONGODB_URI, JWT_SECRET, and (optionally) SMTP creds
npm run seed-admin      # creates admin@delivery.com / Admin@123
npm run dev              # nodemon, http://localhost:5001
```

Swagger docs: `http://localhost:5001/api-docs`

## Roles

`customer`, `agent`, `admin` — enforced via `authMiddleware` (JWT) + `roleMiddleware` on every route.

## Database Schema (Mongoose)

- **User**: `name, email, password, phone, role, zone (agent's home zone), isAvailable, currentLocation {latitude, longitude}`
- **Zone**: `zoneName, areas[]` — admin-defined; `areas` is a list of locality/city keywords used for zone detection.
- **RateCard**: `orderType (B2B/B2C), zoneType (intra/inter), baseCharge, pricePerKg, estimatedDays`. Unique on `(orderType, zoneType)` — 4 rate cards cover every combination.
- **CodConfig**: `orderType (B2B/B2C), surchargeAmount` — flat COD surcharge per order type.
- **Order**: pickup/delivery address + detected zone, `orderType, paymentType, length, breadth, height, actualWeight, volumetricWeight, chargeableWeight, zoneType`, pricing snapshot (`baseCharge, pricePerKg, codSurcharge, deliveryCharge, estimatedDays`), `orderStatus`, `failureReason`, `rescheduledDate`, `deliveryAttempts`.
- **TrackingHistory**: `order, status, updatedBy (actor), note, createdAt` — one immutable row per status change. Never updated or deleted, only inserted — this is the audit trail.

## Rate Calculation Engine (`utils/calculateCharge.js`)

1. **Zone detection** (`utils/detectZone.js`): the pickup/delivery address text is matched (case-insensitive substring match, longest match wins) against each Zone's `areas[]` list. No client-supplied zone IDs — this happens automatically on order creation.
2. **zoneType**: `intra` if pickup zone === delivery zone, else `inter`.
3. **Volumetric weight**: `(L × B × H) / 5000`.
4. **Chargeable weight**: `max(actualWeight, volumetricWeight)`.
5. **Rate card lookup**: `RateCard.findOne({ orderType, zoneType })` — fully admin-configurable, nothing hardcoded.
6. **Charge**: `baseCharge + pricePerKg * chargeableWeight`.
7. **COD surcharge**: if `paymentType === "COD"`, add `CodConfig.findOne({ orderType }).surchargeAmount`.

The computed charge is returned in the `createOrder` response *before* being persisted, so the frontend can show it prior to final confirmation (the create call itself commits the order — see "Two-step confirm" note below if you want a true preview-then-confirm flow).

## Auto-Assignment (`utils/autoAssignAgent.js`)

1. Look for `User` docs with `role: "agent", isAvailable: true, zone: <pickup zone id>`.
2. If none in-zone, fall back to any available agent system-wide.
3. If pickup coordinates and agent `currentLocation` are both present, pick the nearest by haversine distance; otherwise just take the first available match.
4. Triggered via `PATCH /api/orders/:id/auto-assign` (admin), or admin can `PATCH /api/orders/:id/assign-agent` to pick manually.

## Order Status Lifecycle

`created → assigned → picked_up → in_transit → out_for_delivery → delivered`
Alternate paths: `→ failed → rescheduled → assigned (reassigned)`, or `→ cancelled`.

Every transition is written to `TrackingHistory` with the actor and timestamp, and triggers a customer email (`utils/sendEmail.js` — logs to console if SMTP isn't configured, so it never breaks the request in local dev).

## Failed Delivery Flow

1. Agent/admin sets status to `failed` with an optional `failureReason` → `PATCH /api/orders/:id/status`.
2. Customer is emailed and can request a reschedule → `PATCH /api/orders/:id/reschedule` with `{ rescheduledDate }`.
3. Order status becomes `rescheduled`, and `autoAssignAgent` is re-run to reassign a (possibly different) available agent for the new attempt.

## API Overview

| Method | Route | Role |
|---|---|---|
| POST | /api/auth/register | public |
| POST | /api/auth/login | public |
| POST | /api/zones | admin |
| GET | /api/zones | any |
| PUT/DELETE | /api/zones/:id | admin |
| POST | /api/rate-cards | admin |
| GET | /api/rate-cards | any |
| PUT/DELETE | /api/rate-cards/:id | admin |
| POST/GET | /api/cod-config | admin / any |
| POST | /api/agents | admin |
| GET | /api/agents | admin |
| PATCH | /api/agents/:id/zone | admin |
| PATCH | /api/agents/me/status | agent |
| POST | /api/orders | customer, admin |
| GET | /api/orders | admin (supports `?status=&zone=&agent=`) |
| GET | /api/orders/my-orders | customer, agent |
| GET | /api/orders/:id | owner / assigned agent / admin |
| GET | /api/orders/:id/tracking | any involved party |
| PATCH | /api/orders/:id/assign-agent | admin |
| PATCH | /api/orders/:id/auto-assign | admin |
| PATCH | /api/orders/:id/status | admin, agent |
| PATCH | /api/orders/:id/reschedule | customer, admin |
| GET | /api/dashboard/admin \| /agent \| /customer | role-matched |

Full request/response schemas: `/api-docs` (Swagger).
