# Authentication API

## Setup

1. Copy `.env.example` to `.env` and replace every placeholder. Use distinct random JWT secrets of at least 32 characters and a base64 encoded 32-byte AES key.
2. Start PostgreSQL and Redis, and configure SMTP and a Google reCAPTCHA secret.
3. Run `npm install`, then `npm run build` and `npm run start:dev`. The initial TypeORM migration runs automatically at startup. Schema synchronization is disabled.
4. ReCAPTCHA registration and login require a browser-issued CAPTCHA token. Configure the frontend links in `FRONTEND_URL` so its confirmation and reset pages forward the received token to the API.

The application fails startup when required configuration is missing or malformed, and when PostgreSQL or Redis cannot connect. No credentials are included in the repository.

## Endpoints

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public + CAPTCHA | Create an unverified account and send email confirmation |
| POST | `/auth/login` | Public + CAPTCHA | Verify credentials and return access and refresh tokens |
| POST | `/auth/confirm-email` | Public | Consume a one-time confirmation token |
| POST | `/auth/resend-confirmation` | Public | Resend confirmation (generic response and per-email limit) |
| POST | `/auth/refresh` | Public | Rotate the single active refresh token for the account |
| POST | `/auth/logout` | Public | Revoke the refresh token and its associated access token |
| POST | `/auth/forgot-password` | Public | Send a reset email when eligible (generic response) |
| POST | `/auth/reset-password` | Public | Consume a reset token and replace the password |
| GET | `/users/me` | Bearer access token | Return the authenticated user's public profile |
| GET | `/users` | Admin role | List users; hashes are excluded by the entity mapping |
| GET | `/users/:id` | Admin role | Retrieve a user's public account record |
| DELETE | `/users/:id` | Admin role | Delete a user |

Global request validation rejects unknown fields. Request rate limits are stored in Redis and therefore shared by application instances.

## Example requests

Import `postman/authentication.postman_collection.json` into Postman for a collection with request variables and automatic access/refresh token updates after login and refresh.
The CAPTCHA token is single-use and expires quickly; replace the `captchaToken` variable with a newly issued frontend token for each registration or login request.

Register:

```http
POST /auth/register
Content-Type: application/json

{"email":"person@example.com","password":"correct-horse-battery-staple","captchaToken":"browser-recaptcha-token"}
```

Confirm email:

```http
POST /auth/confirm-email
Content-Type: application/json

{"token":"token-from-confirmation-link"}
```

Login:

```http
POST /auth/login
Content-Type: application/json

{"email":"person@example.com","password":"correct-horse-battery-staple","captchaToken":"browser-recaptcha-token"}
```

Use the returned access token on protected endpoints:

```http
GET /users/me
Authorization: Bearer <accessToken>
```

Refresh:

```http
POST /auth/refresh
Content-Type: application/json

{"refreshToken":"<refreshToken>"}
```

Refresh tokens rotate on use. Store the latest response securely and discard the previous token. Logout, forgot-password, and reset-password take `refreshToken`, `email`, and `{ "token": "...", "newPassword": "..." }` respectively.

## Operations

- Assign the first administrator through a controlled database operation after creating and verifying an account: `UPDATE users SET role = 'admin' WHERE email = '...';` Do not expose role assignment in public registration.
- Configure SMTP TLS and reCAPTCHA host expectations for the deployed environment. For a compatible CAPTCHA provider, set `CAPTCHA_VERIFY_URL` to its HTTPS verification endpoint.
- Cache reads and writes are best effort; authentication token and rate-limit operations use Redis directly and fail closed if Redis is unavailable.
- Access tokens expire quickly; refresh/logout state is held in Redis. Password reset invalidates refresh tokens. Regularly rotate secrets with a plan for invalidating outstanding tokens.
