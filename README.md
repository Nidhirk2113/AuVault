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


### Connected Healthcare Ecosystem: HealthKonnect × AuVault

A proposed future integration is to connect AuVault with **[HealthKonnect](https://github.com/Nidhirk2113/HealthKonnect)**, a separate clinic and mental-health platform. The goal is to explore a connected patient-to-pharmacy workflow while keeping both applications independently deployable, with their own databases, services and release cycles.

Potential capabilities:

1. **Prescription handoff:** Allow an authorised clinician to make a finalised prescription available to a connected pharmacy through a secure, authenticated API. AuVault would receive only the minimum prescription information required for verification and dispensing.
2. **Medicine availability:** Let an authorised HealthKonnect workflow request availability information from AuVault, including whether a requested medicine is in stock. Availability responses should avoid exposing internal stock or supplier data unnecessarily.
3. **Pharmacy verification and dispensing:** Let a pharmacist review the prescription, verify its status and dispense eligible items using AuVault's existing stock controls. Prescription verification must remain distinct from clinical prescribing.
4. **Dispensing status updates:** Return a limited status to HealthKonnect, such as received, under review, partially dispensed, fully dispensed or unable to fulfil.
5. **Reference-based linking:** Use unique, non-guessable prescription and integration references to associate records across systems without copying entire patient profiles or creating a shared database.
6. **Operational insights:** Explore aggregated reporting on fulfilment rates, frequently requested medicines and availability trends, subject to appropriate access controls and de-identification.

**Possible integration approach:** Use versioned REST APIs with service-to-service authentication, scoped permissions, request validation, idempotency keys, secure transport, audit events and explicit patient consent where applicable. Each application remains the system of record for its own data; direct database sharing is not planned.

**Privacy and safety considerations:** Share only the minimum necessary data, verify prescription authenticity and validity, enforce pharmacist and clinician permissions, record access and dispensing events, and define revocation, retention and failure-handling procedures. Do not expose sensitive patient or prescription details in URLs or ordinary application logs. Any real-world deployment would require appropriate clinical, legal, privacy and regulatory review.

**Status:** This is a conceptual future enhancement only. No live integration, shared authentication, cross-system API, prescription transfer or synchronised dispensing workflow is currently claimed as implemented.


- Unit and integration tests for the dispense transaction
- Pagination and CSV export
- Email or SMS alerts for low stock
- Rate limiting on login
- Deployment: backend on AWS (EC2 or Elastic Beanstalk), frontend on S3 + CloudFront or Vercel
