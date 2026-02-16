# Hotel Service

Node.js + TypeScript service for **hotel catalog**, room types, inventory, rates, and **availability** checks. Supports full-text **search** via Elasticsearch (name, address, location). Index is kept in sync on create/update/delete (best-effort).

## Tech stack

- **Node.js**, **Express**, **TypeScript**
- **Prisma** + **MySQL**
- **Elasticsearch** (`@elastic/elasticsearch`)
- **Zod** validation, **Winston** logging

## Responsibilities

- **Hotels:** CRUD; list all or search by `?q=...` (ES). List/search **public** when called via gateway.
- **Room types:** CRUD per hotel (host).
- **Inventory / rates:** Define inventory and rates for date ranges.
- **Availability:** Check available rooms for given dates (used by booking-service).

## Run

```bash
npm install
npx prisma generate
npx prisma migrate dev   # or deploy migration
npm run dev
```

Default: `PORT=3001`. Direct base: `http://localhost:3001/api/v1`. Use gateway in production (`/hotel-api/*`).

## Environment

| Variable                                                   | Default                 | Description                                    |
| ---------------------------------------------------------- | ----------------------- | ---------------------------------------------- |
| `PORT`                                                     | `3001`                  | Server port                                    |
| `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_NAME` or `DATABASE_*` | —                       | MySQL                                          |
| `ELASTICSEARCH_NODE`                                       | `http://localhost:9200` | ES node; empty = search disabled, 503 on `?q=` |

## Main endpoints (under `/api/v1`)

- **Hotels:** `GET /hotels`, `GET /hotels?q=...`, `GET /hotels/:id`, `POST/PUT/DELETE /hotels` (host)
- **Room types:** `GET/POST/PUT/DELETE /room-types`, `GET /room-types/:id`
- **Inventories / rates:** `POST /inventories`, `POST /rates`
- **Availability:** `POST /availability/check`
