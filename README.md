# webPe - A UPI Ecosystem Replica

> **Note**
> This project is a work in progress. Functionality may be incomplete or subject to change.

## About The Project

webPe is a full-stack application that aims to replicate the core functionalities of a Unified Payments Interface (UPI) ecosystem. It consists of a frontend client and a backend server, working together to simulate digital payment transactions.

---

## 🚀 Getting Started

To get the entire project up and running, you will need to set up both the frontend and the backend components.

### Prerequisites

You need to have the following software installed on your machine.
- [Node.js](https://nodejs.org/en/download/) (which includes npm)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/downloads)

### Project Installation

1.  Clone the repository to your local machine:
    ```sh
    git clone <your-repository-url>
    cd webPe
    ```
2.  Follow the setup instructions for the [Backend](#-backend) below.
3.  Follow the setup instructions for the [Frontend](#-frontend).

---

## 🖥️ Frontend

This section describes the client-side of the webPe application.

> **TODO:** Please fill in the details about the frontend application.

### Tech Stack

*   **Framework**: `[e.g., React, Vue]`
*   **Language**: `[e.g., TypeScript, JavaScript]`
*   **Styling**: `[e.g., Tailwind CSS, Material-UI, CSS Modules]`
*   **State Management**: `[e.g., Redux]`
*   **Routing**: `[e.g., React Router]`

### Setup and Running

1.  Navigate to the frontend directory (e.g., `client` or `frontend`).
    ```sh
    cd <frontend-directory>
    ```
2.  Install the dependencies:
    ```sh
    npm install
    ```
3.  Start the development server:
    ```sh
    npm run dev
    ```

---

## ⚙️ Backend

This is the backend server for the webPe application, built with Node.js and Express.

### Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: bcryptjs for password hashing
- **HTTP Client**: axios
- **Development**: ts-node-dev for live-reloading

### Setup and Running

1.  Navigate to the `server` directory:
    ```sh
    cd server
    ```
2.  Install the dependencies:
    ```sh
    npm install
    ```
3.  Create a `.env` file in the `server` directory and add your database connection string:
    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    ```
4.  Apply the database schema using Prisma Migrate:
    ```sh
    npx prisma migrate dev
    ```
5.  (Optional) Seed the database with initial data:
    ```sh
    npm run seed
    ```
6.  Start the development server:
    ```sh
    npm run dev
    ```