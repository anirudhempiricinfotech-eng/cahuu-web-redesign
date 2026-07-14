# MiniShop API — documentation audit fixture

MiniShop is a production-shaped NestJS commerce API fixture used to validate source discovery, schema/validation extraction, authentication analysis, issue ranking, tracker synchronisation, Jira deduplication, collection generation, reporting, retries, and per-endpoint failure isolation.

> This repository intentionally contains traceable documentation defects. See `docs/audit-fixture-manifest.json` for expected results; do not “fix” them in the fixture branch.

## Local setup

Requires Node.js 22+, PostgreSQL 16+, and Redis 7+.

1. Copy `.env.local.example` to `.env` and replace every `REPLACE_WITH_...` value.
2. Run `npm ci`, `npm run build`, and `npm run start:dev`.
3. The API is served under `http://localhost:3100/api`.

The checked-in templates cover local, development, staging, and production environments. Private keys, payment credentials, and database passwords must be supplied through the deployment secret store and must never be committed.

## Conventions

All timestamps are UTC ISO 8601 strings. Monetary amounts are integer paise. Resource IDs are UUIDs except externally assigned IDs such as payment and checkout references. Success envelopes use `data` and optional `meta`; errors use `code`, `message`, and optional `details`. Send `Authorization: Bearer <token>` where a route is protected and optionally send `x-correlation-id` for cross-service tracing.

## Public API overview

| Method | Route | Description |
|---|---|---|
| POST | /api/v1/auth/register | Create a customer account |
| POST | /api/v1/auth/login | Exchange credentials for tokens |
| POST | /api/v1/auth/refresh | Rotate an access token |
| GET | /api/v2/products | Browse the product catalogue |
| GET | /api/v2/products/:productId | Read a product |
| GET | /api/v2/categories | List categories |
| GET | /api/v2/categories/:categoryId/products | Browse a category |
| GET | /api/v1/products/:productId/reviews | Read approved reviews |

Selected authenticated operations:

| Method | Route | Required access |
|---|---|---|
| GET/PATCH | /api/v1/users/me | Customer |
| POST | /api/v2/products | Manager or administrator with `catalog:write` |
| DELETE | /api/v2/products/:productId | Administrator with `catalog:delete` |
| POST/GET | /api/v1/orders | Authenticated customer |
| GET | /api/v1/orders/:orderId | Order owner |
| GET/POST/PATCH/DELETE | /api/v1/cart and /api/v1/cart/items | Authenticated customer |
| POST | /api/v1/payments/:paymentId/capture | Manager or administrator with `payments:capture` |
| GET | /api/v1/inventory | Manager or administrator with `inventory:read` |

The overview deliberately omits several implemented operations for audit coverage.

## Examples

Register a customer:

```http
POST /api/v1/auth/register
Content-Type: application/json

{"email":"kavya.menon@malabarcrafts.in","password":"Nila!River7Grove","displayName":"Kavya Menon","phone":"+919845612730"}
```

Create a catalog item:

```http
POST /api/v2/products
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
Content-Type: application/json

{"sku":"KORI-710482","name":"Kori Brass Masala Box","description":"Hand-spun seven-cup spice keeper with an engraved teak lid.","pricePaise":869900,"categoryId":"14aeb17e-b1e0-4a70-a87d-0d841a4f95ec","tags":["kitchen","brass"],"active":true}
```

Successful catalogue response:

```json
{"data":[{"id":"b51f34f6-daa3-4f1e-a573-f8b77db56027","sku":"AUR-48271","name":"Aurora Pour-Over Kettle","pricePaise":749900,"availableQuantity":18,"averageRating":4.7}],"meta":{"page":1,"limit":20,"total":1}}
```

Validation failures return HTTP 400:

```json
{"code":"VALIDATION_FAILED","message":"Request validation failed","details":[{"field":"pricePaise","rule":"min","message":"pricePaise must not be less than 50"}]}
```

Authentication failures return HTTP 401:

```json
{"code":"AUTH_REQUIRED","message":"A valid bearer token is required"}
```

Other domain errors include `PRODUCT_NOT_FOUND` (404), `ORDER_NOT_FOUND` (404), `SKU_EXISTS` (409), `PAYMENT_ALREADY_CAPTURED` (409), and `INSUFFICIENT_STOCK` (409). Complete per-endpoint payloads are in `docs/api-examples.json`.

## Audit data

- `docs/openapi.yaml`: deliberately incomplete and partially stale API description.
- `postman/postman_collection_old.json`: a valid but obsolete collection.
- `docs/api-documentation-tracker.csv`: 38-row Google Sheets import seed.
- `docs/audit-fixture-manifest.json`: source-backed expected findings, Jira scenarios, and scoring.
- `docs/api-examples.json`: deterministic success and error cases.
- `insomnia/README.md`: collection-generation assertions rather than a pre-generated current collection.
