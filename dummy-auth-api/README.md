# Cahuu dummy Auth API

A dependency-free, in-memory HTTP API for testing API documentation, Postman/Insomnia workflows and Auth clients. It uses Node.js 20 built-ins only and is intentionally isolated from the placeholder web application.

> This is test code, not a production authentication service. All state and issued tokens disappear when the process restarts.

## Run

```powershell
cd dummy-auth-api
npm test
npm start
```

The default base URL is `http://127.0.0.1:3000`. Override it with the `PORT` environment variable.

## Seeded dummy account

| Field | Value |
|---|---|
| Name | Aarav Mehta |
| Email | `aarav.mehta@example.test` |
| Password | `CahuuDemo9` |
| Password-reset token | `dummy-reset-token-aarav-2026` |

These values are intentionally fictional and may only be used in local tests.

## Endpoint summary

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | No | Service readiness response |
| POST | `/api/v1/auth/signup` | No | Validate input, create a dummy user and return tokens |
| POST | `/api/v1/auth/login` | No | Authenticate a dummy user; limited to five attempts per IP per minute |
| POST | `/api/v1/auth/refresh` | Refresh token in JSON body | Rotate a refresh token and issue a new session |
| POST | `/api/v1/auth/forgot-password` | No | Return the same 202 response whether the email exists or not |
| POST | `/api/v1/auth/reset-password` | Reset token in JSON body | Update a password and revoke the user's sessions |
| GET | `/api/v1/auth/session` | Bearer access token | Return the authenticated user/session |
| DELETE | `/api/v1/auth/session` | Bearer access token | Revoke the supplied access token |

All responses that include data are JSON. Generated access tokens last 15 minutes; refresh tokens last seven days. State is stored in memory.

The v1 login route is dispatched by `src/server.js` to
`AuthController.login` in `src/controllers/auth.controller.js`. Its request is
represented by `LoginRequestDto` in `src/dto/login-request.dto.js`, whose
declarative validation metadata marks `email` and `password` required. The
in-memory account is a `UserEntity` in `src/entities/user.entity.js`; its
public projection excludes `passwordHash`.

## Curl examples

Health:

```powershell
curl.exe http://127.0.0.1:3000/health
```

Signup success:

```powershell
curl.exe -X POST http://127.0.0.1:3000/api/v1/auth/signup -H "Content-Type: application/json" -d '{\"name\":\"Maya Shah\",\"email\":\"maya.shah@example.test\",\"password\":\"RiverStone8\",\"acceptTerms\":true}'
```

Validation failure (weak password):

```powershell
curl.exe -X POST http://127.0.0.1:3000/api/v1/auth/signup -H "Content-Type: application/json" -d '{\"name\":\"Maya Shah\",\"email\":\"maya.shah@example.test\",\"password\":\"weak\",\"acceptTerms\":true}'
```

Login:

```powershell
curl.exe -X POST http://127.0.0.1:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{\"email\":\"aarav.mehta@example.test\",\"password\":\"CahuuDemo9\"}'
```

Use the returned access token:

```powershell
$env:AUTH_TOKEN = "paste-only-the-dummy-access-token-here"
curl.exe http://127.0.0.1:3000/api/v1/auth/session -H "Authorization: Bearer $env:AUTH_TOKEN"
```

Refresh a session:

```powershell
curl.exe -X POST http://127.0.0.1:3000/api/v1/auth/refresh -H "Content-Type: application/json" -d '{\"refreshToken\":\"paste-only-the-dummy-refresh-token-here\"}'
```

Reset the seeded dummy user's password:

```powershell
curl.exe -X POST http://127.0.0.1:3000/api/v1/auth/reset-password -H "Content-Type: application/json" -d '{\"resetToken\":\"dummy-reset-token-aarav-2026\",\"newPassword\":\"NewCahuuPass7\"}'
```

Log out:

```powershell
curl.exe -i -X DELETE http://127.0.0.1:3000/api/v1/auth/session -H "Authorization: Bearer $env:AUTH_TOKEN"
```

## Validation and error format

Signup fields:

- `name`: required string, trimmed length 2â€“80.
- `email`: required valid email, maximum 254 characters.
- `password`: required string, 8â€“72 characters, with at least one uppercase letter, lowercase letter and digit.
- `acceptTerms`: required and must be literal Boolean `true`.

Example error:

```json
{
  "error": {
    "status": 401,
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect.",
    "timestamp": "2026-07-02T10:15:00.000Z"
  }
}
```

Possible statuses are 200, 201, 202, 204, 400, 401, 404, 409, 413, 429 and 500. Login rate-limit responses include a `Retry-After` header.

