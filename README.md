# Clinic Pharmacy Stock Tracker

A full-stack inventory app for a clinic or hospital pharmacy. Staff track medicine stock with batch numbers and expiry dates, dispense medicines safely, and get alerts for low stock and expiring or expired items.

Built with the MERN stack (MongoDB, Express, React, Node.js) to mirror a typical healthcare platform.

## Features

- Login with JWT and two roles: **admin** (manages medicines, sees audit log) and **pharmacist** (dispenses and views stock)
- Medicine management: name, SKU, batch, expiry date, price, stock, low-stock threshold
- **Dispensing in a database transaction**: all items succeed or nothing changes
- Alerts for low stock, expiring within 30 days, and expired medicines
- Dashboard with revenue per day and top dispensed medicines charts
- Dispense history and an admin-only **audit log** (who did what, when)

## Tech stack

| Layer    | Tools |
|----------|-------|
| Frontend | React 18 (JavaScript), Vite, React Router, Tailwind CSS, Recharts |
| Backend  | Node.js, Express 5, Mongoose, Zod, JWT, bcrypt, Helmet |
| Database | MongoDB (Atlas free tier recommended) |

## Getting started

### 1. Database
Create a free cluster on MongoDB Atlas and copy the connection string. Atlas is recommended because MongoDB transactions require a replica set, which a default local `mongod` does not have.

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env        # then fill in MONGO_URI and JWT_SECRET
npm run seed                # sample users and medicines
npm run dev                 # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```
The Vite dev server proxies `/api` to the backend, so no extra CORS setup is needed.

### Demo accounts (after seeding)
- Admin: `admin@clinic.test` / `Admin@1234`
- Pharmacist: `pharmacist@clinic.test` / `Pharma@1234`

## API overview

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| POST | `/api/auth/register` | public | Register (first user becomes admin) |
| POST | `/api/auth/login` | public | Login, returns JWT |
| GET | `/api/medicines` | any user | List medicines |
| POST / PUT / DELETE | `/api/medicines[/:id]` | admin | Manage medicines |
| POST | `/api/dispense` | any user | Dispense medicines (transactional) |
| GET | `/api/dispense` | any user | Recent dispenses |
| GET | `/api/reports/alerts` | any user | Low stock, expiring, expired |
| GET | `/api/reports/stats` | any user | Dashboard chart data |
| GET | `/api/reports/audit` | admin | Audit log |

## Design decisions

- **No overselling.** Dispensing uses an atomic conditional update (`stock >= quantity` and not expired) inside a transaction. Stock cannot go negative even if two pharmacists dispense the last unit at the same time.
- **Expired medicine is blocked** at the database query level, not only in the UI.
- **Money in integer paise** to avoid floating-point errors.
- **Price and name snapshots** are stored on each dispense item, so history stays correct when prices change.
- **Audit log inside the transaction**, so a dispense and its log entry always succeed or fail together.

## Privacy and security

- Passwords hashed with bcrypt; JWTs expire after 24 hours
- Role-based access control enforced on the server, not just hidden in the UI
- Request validation with Zod; consistent error handling that does not leak internals
- Login returns one generic error for wrong email or password
- Helmet and CORS configured
- Audit trail supports accountability, in line with the data-protection principles of the DPDP Act 2023
- This app stores no patient data. A production version would add encryption at rest, rate limiting, and stricter staff onboarding.

## Possible improvements

- Unit and integration tests for the dispense transaction
- Pagination and CSV export
- Email or SMS alerts for low stock
- Rate limiting on login
- Deployment: backend on AWS (EC2 or Elastic Beanstalk), frontend on S3 + CloudFront or Vercel
