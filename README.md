# MiniLedger

A small app to track money you lent to friends.

- `backend/`: Node.js + TypeScript + Express + PostgreSQL API
- `mobile/`: React Native (Expo) app

## Run the backend

Needs Node 20+ and PostgreSQL.

```bash
createdb miniledger
cd backend
npm install
cp .env.example .env        # then edit JWT_SECRET
set -a; source .env; set +a  # load the variables into your shell
npm run db:init              # creates the tables
npm run dev                  # API on http://localhost:4000
```

Run the tests: `npm test`.

## Login (mock OTP)

1. `POST /auth/request-otp` with `{ "phone": "+919876543210" }`
2. Look at the **server log**. It prints `[MOCK OTP] +919876543210 -> 123456`.
3. `POST /auth/verify-otp` with `{ "phone": "...", "otp": "123456" }` returns `{ "token": "..." }`.
4. Send `Authorization: Bearer <token>` on every other request.

## API

| Method | Path | What it does |
|---|---|---|
| POST | /auth/request-otp | Create an OTP (printed in server log) |
| POST | /auth/verify-otp | Check the OTP, return a token |
| POST | /loans | Add a loan: `friendName`, `amount`, `dueDate` (YYYY-MM-DD) |
| GET | /loans | List loans. Each has `overdue: true/false` |
| PATCH | /loans/:id/repaid | Mark a loan as repaid |
| GET | /summary | `totalLent`, `totalRepaid`, `overdueAmount` |

A loan is **overdue** when it is not repaid and the due date is before today.
