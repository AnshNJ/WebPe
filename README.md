# webPe - A UPI Ecosystem Replica

> **Note**
> This project is a work in progress. Functionality may be incomplete or subject to change.

## About The Project

webPe is a full-stack platform that replicates the core functionalities of the Unified Payments Interface (UPI) ecosystem. It comprises a React frontend (with Material UI), a Node/Express backend, Prisma/PostgreSQL for data storage, and a mock NPCI server for payment clearing.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (npm included)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/downloads)

### Project Installation

1.  Clone the repository:
    ```sh
    git clone <your-repository-url>
    cd webPe
    ```
2.  Set up the backend, frontend, and NPCI mock server (see detailed instructions below).

---

## 🖥️ Frontend (`client`)

### Tech Stack

- **Framework**: React (TypeScript)
- **Styling/UI**: Material-UI (MUI)
- **Routing**: React Router v6+
- **State/Context**: React Context API for authentication and user state

### Key Features

- **Authentication**: Login page, JWT storage, protected routes
- **Pages**:
  - Dashboard (balance, quick stats, recent & all transactions)
  - Send Money & Request Money flows (with validation)
  - Transaction History and Transaction Details
  - Profile/Account page (user stats, wallet info, VPAs)
  - Manage VPAs (CRUD and set primary)
- **Persistent auth context**: All user/account state managed via React context across the app
- **Modern UI**: Dark theme, gradients, responsive, accessible components
- **API integration**: Calls to backend for all data, uses JWT in headers

### Setup & Running

```sh
cd client
npm install
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) (or as shown in terminal).

---

## ⚙️ Backend (PSP Server) (`server`)

### Tech Stack

- **Framework**: Node.js, Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (planned), bcryptjs
- **API Client**: axios (for NPCI)
- **Development**: ts-node-dev, nodemon

### API Endpoints

#### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- (planned) JWT tokens in HTTP Authorization header

#### User

- `GET /api/user/profile` – Profile, account stats
- `GET /api/user/balance` – Wallet balance
- `PUT /api/user/profile` – Update info

#### VPAs

- `GET /api/user/vpas` – List all VPAs for user
- `POST /api/vpas` – Create VPA
- `PATCH /api/vpas/:id/set-primary` – Set primary VPA
- `DELETE /api/vpas/:id` – Remove VPA

#### Transactions

- `POST /api/transactions` – Initiate payment (calls NPCI mock)
- `GET /api/transactions/:id/status` – Poll status (PENDING, SUCCESS, FAILED)
- `GET /api/transactions/:id` – Transaction details (planned)
- `GET /api/transactions` – Transaction history (planned with filters for status, date, VPA, etc.)

#### Money Requests (Planned)

- `POST /api/money-requests`
- `GET /api/money-requests/pending`
- etc.

### Integration with NPCI

- Payment requests forwarded to mock NPCI server at `http://localhost:3002/api/process-payment` (see NPCI section)

### Setup & Running

```sh
cd server
npm install
# Create & edit .env as needed (see below)
npx prisma migrate dev
npm run dev
```

#### Environment Variables (`.env` example)

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
JWT_SECRET=<your-secret>
NPCI_API_URL=http://localhost:3002/api
PORT=3001
```

---

## 🏦 NPCI Mock Server (`npci-server`)

Simulates third-party payment clearing for UPI.

- Exposes: `POST /api/process-payment`
- Payload: `{ pspTransactionId, amount, payerVpa, payeeVpa }`
- Responds: `{ status: 'approved' | 'rejected', message }`
- Behavior: Approves/rejects with random (configurable) success rate and delay for realism.

**Setup**:
```sh
cd npci-server
npm install
npm run dev
```
Server runs on port 3002 by default.

---

## Developing, Debugging, and Extending

- **Frontend**: All major pages are in `client/src/pages/`
- **Context**: Extend `client/src/contexts/AuthContext.tsx` for new user/account- or wallet-related state.
- **Backend**: All routers and controllers in `server/src/routes/` and `server/src/controllers/`
- **DB Models**: Managed with Prisma in `server/prisma/schema.prisma`. Use `npx prisma studio` for admin UI.

---

## Contribution and Feedback

PRs and issues welcome! See TODOs in code comments and the open [issues](link-to-issues).

---

## License

MIT License (add your info here)

---