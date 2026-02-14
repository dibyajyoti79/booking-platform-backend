# Hotel Service – API Gateway Endpoints

All hotel-service requests go through the **API Gateway (auth-service)** under a single prefix.

- **Base URL:** `http://localhost:8080` (or your gateway `PORT`)
- **Hotel service prefix:** `/hotel-api` — all paths under this are proxied to hotel-service with path rewritten to `/api/v1/*`.  
  New APIs added in hotel-service under `/api/v1` are available at `/hotel-api/*` with no gateway change.

**Auth:** Endpoints below require a valid JWT in the `Authorization: Bearer <token>` header (obtain via `POST /login`).  
**Host-only:** Create/update/delete require the user role **host** (gateway forwards `X-User-Role` to hotel-service).

---

## Hotels

| Method | Gateway path               | Description     | Auth | Role |
|--------|----------------------------|-----------------|------|------|
| GET    | `/hotel-api/hotels`        | List all hotels | JWT  | any  |
| GET    | `/hotel-api/hotels/{id}`   | Get hotel by ID | JWT  | any  |
| POST   | `/hotel-api/hotels`       | Create hotel    | JWT  | host |
| PUT    | `/hotel-api/hotels/{id}`   | Update hotel    | JWT  | host |
| DELETE | `/hotel-api/hotels/{id}`   | Delete hotel    | JWT  | host |

**Create/update body (hotel):**
```json
{
  "name": "Hotel Name",
  "address": "Full address",
  "location": "City or area",
  "checkInTime": "14:00",
  "checkOutTime": "11:00"
}
```
Update (PUT) can send a subset of fields (partial).

---

## Room types

| Method | Gateway path                    | Description         | Auth | Role |
|--------|----------------------------------|---------------------|------|------|
| GET    | `/hotel-api/room-types`         | List all room types | JWT  | any  |
| GET    | `/hotel-api/room-types/{id}`    | Get room type by ID | JWT  | any  |
| POST   | `/hotel-api/room-types`         | Create room type    | JWT  | host |
| PUT    | `/hotel-api/room-types/{id}`    | Update room type    | JWT  | host |
| DELETE | `/hotel-api/room-types/{id}`    | Delete room type    | JWT  | host |

**Create body (room type):**
```json
{
  "hotelId": 1,
  "name": "Deluxe",
  "maxOccupancy": 4
}
```

**Update body (room type):** optional fields
```json
{
  "name": "Deluxe Plus",
  "maxOccupancy": 5
}
```

---

## Example (gateway base `http://localhost:8080`)

```bash
# List hotels (JWT required)
curl -H "Authorization: Bearer YOUR_JWT" http://localhost:8080/hotel-api/hotels

# Get one hotel
curl -H "Authorization: Bearer YOUR_JWT" http://localhost:8080/hotel-api/hotels/1

# Create hotel (host only)
curl -X POST http://localhost:8080/hotel-api/hotels \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Grand Hotel","address":"1 Main St","location":"City","checkInTime":"14:00","checkOutTime":"11:00"}'

# List room types
curl -H "Authorization: Bearer YOUR_JWT" http://localhost:8080/hotel-api/room-types

# Create room type (host only)
curl -X POST http://localhost:8080/hotel-api/room-types \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"hotelId":1,"name":"Suite","maxOccupancy":3}'
```

---

## Path mapping (gateway → hotel-service)

**Single rule:** Strip prefix `/hotel-api`, add `/api/v1`. Everything under `/hotel-api/*` goes to hotel-service as `/api/v1/*`.

| Gateway path              | Hotel-service path        |
|---------------------------|---------------------------|
| `/hotel-api`             | `/api/v1`                 |
| `/hotel-api/hotels`      | `/api/v1/hotels`          |
| `/hotel-api/hotels/{id}` | `/api/v1/hotels/{id}`     |
| `/hotel-api/room-types`  | `/api/v1/room-types`      |
| `/hotel-api/room-types/{id}` | `/api/v1/room-types/{id}` |
| *(any new path)*         | *(no gateway change)*    |
