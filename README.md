# TradespaceX — Accounts (dummy frontend)

A working React frontend for the **User Authentication & Account** endpoints,
built to run standalone now and plug into the real Django/DRF backend later
with minimal changes.

## Run it

```bash
npm install
npm run dev
```

Visit the printed localhost URL. Try registering an account, then log in —
everything (users, sessions, tokens) is stored in `localStorage`, so it
persists across refreshes but is entirely local to your browser.

## Endpoints covered

Each function in `src/api/authApi.js` mirrors one real endpoint (path noted
in its comment):

| Endpoint | Function |
|---|---|
| `POST /api/v1/accounts/register/` | `register()` |
| `POST /api/v1/accounts/login/` | `login()` |
| `POST /api/v1/accounts/refresh/` | `refreshToken()` |
| `POST /api/v1/accounts/logout/` | `logout()` |
| `GET /api/v1/accounts/me/` | `getMe()` |
| `PUT /api/v1/accounts/profile/update/` | `updateProfile()` |
| `PUT /api/v1/accounts/password/change/` | `changePassword()` |
| `POST /api/v1/accounts/password/forgot/` | `forgotPassword()` |
| `POST /api/v1/accounts/password/reset/` | `resetPassword()` |
| `POST /api/v1/accounts/email/verify/` | `verifyEmail()` |
| `POST /api/v1/accounts/email/resend-verification/` | `resendVerification()` |

## How to swap in the real backend

The pages and `AuthContext` only ever call functions from `src/api/authApi.js`
— they never touch `localStorage` or mock logic directly. To connect the real
API:

1. In `authApi.js`, replace each function body with a `fetch`/`axios` call to
   the matching path (e.g. `fetch('/api/v1/accounts/login/', { method: 'POST', body: ... })`).
2. Keep each function's **input shape and return shape identical** — that's
   the contract the rest of the app depends on.
3. Delete `src/api/client.js` (the mock DB/token helper) once nothing imports
   it.
4. In `AuthContext.jsx`, nothing needs to change — it already expects
   `{ access, refresh, user }` from `login()`, a full user object from
   `getMe()`, etc., matching what the real JWT endpoints return.
5. For refresh-token auto-renewal (access token expiry), wrap your real
   `fetch` calls in a small interceptor that calls `refreshToken()` on a 401
   and retries once — this mock doesn't simulate token expiry, so that logic
   doesn't exist yet.

## Structure

```
src/
  api/
    client.js       mock "backend" (localStorage-based), delete when real API is wired up
    authApi.js       one function per endpoint — the only file pages talk to
  context/
    AuthContext.jsx  session state, current user, login/logout
  components/
    AuthLayout.jsx   shared card shell for auth pages
    Field.jsx        label + input + error wrapper
    Stamp.jsx         verification/trust seal (signature visual element)
    Navbar.jsx, ProtectedRoute.jsx
  pages/
    Register.jsx, Login.jsx, ForgotPassword.jsx, ResetPassword.jsx,
    VerifyEmail.jsx, Dashboard.jsx, Profile.jsx, ChangePassword.jsx
```

## Design notes

Visual identity is built around trade documentation — ledger cards, a
serif "manifest" heading face (Fraunces), monospace for IDs/codes (IBM Plex
Mono), and a rotated wax-seal "Stamp" component used wherever trust/
verification status is shown, tying back to the "TradeSpace Verified" system
in the product blueprint.

## Next systems to build the same way

Follow this same pattern (dedicated `api/*.js` file mirroring real endpoints,
pages calling only that file) for Marketplace, Communication, Orders,
Payments, TSE, and the Business Dashboard as those endpoint specs come in.
