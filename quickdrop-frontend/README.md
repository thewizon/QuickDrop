# QuickDrop – Last-Mile Delivery Tracker (Frontend)

React 19 + Vite + Tailwind frontend for the delivery management platform.

## Setup

```bash
npm install
cp .env.example .env      # point VITE_API_URL at your running backend
npm run dev                # http://localhost:5173
```

## Roles / Routes

- `/` – Landing page
- `/login`, `/register` – Auth (self-registration is always as a customer)
- `/customer/dashboard` – Book a delivery (address + package details → live charge preview → confirm), view orders & tracking timeline
- `/agent/dashboard` – View assigned deliveries, advance status (Picked Up → In Transit → Out for Delivery → Delivered, or Failed), toggle availability
- `/admin/dashboard` – Overview stats, manage Zones (name + areas), Rate Cards (B2B/B2C × intra/inter) + COD surcharge, create/manage Agents, view & filter all Orders, manually or auto-assign agents, override any order status

All API calls go through `src/services/api.js` (axios instance with JWT auto-attached from localStorage) and are pointed at `VITE_API_URL`.

## Notes

- The "Calculate Charge" step on the customer dashboard calls `POST /orders/preview-charge` (no order created) so the price is shown before the customer confirms, per spec. "Confirm & Book" then calls `POST /orders` to actually create it.
- Requires the backend from the sibling `quickdrop-backend` zip to be running with at least one Zone, one RateCard per (orderType, zoneType) combo, and (optionally) a COD config, or order creation/preview will fail with a clear error message telling the admin what's missing.
