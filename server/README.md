# Server

> **Note**
> This project is a work in progress. Functionality may be incomplete or subject to change.

## About

This is the backend server for the webPe application. The primary goal of this project is to replicate the core functionalities of a Unified Payments Interface (UPI) ecosystem. The server is a Node.js application built with Express and TypeScript, and it uses Prisma as the ORM to interact with a PostgreSQL database.

## Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: [bcryptjs](https://www.npmjs.com/package/bcryptjs) for password hashing
- **HTTP Client**: [axios](https://axios-http.com/)
- **Development**: [ts-node-dev](https://www.npmjs.com/package/ts-node-dev) for live-reloading

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js and npm installed on your machine.
- [Node.js](https://nodejs.org/en/download/) (which includes npm)
- [PostgreSQL](https://www.postgresql.org/download/)

### Installation

1.  Clone the repository.
2.  Navigate to the `server` directory.
3.  Install the dependencies:
    ```sh
    npm install
    ```

### Configuration

1.  Create a `.env` file in the root of the `server` directory.
2.  Add your database connection string to the `.env` file. Prisma uses this to connect to your database.

    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    ```

3.  Apply the database schema using Prisma Migrate:
    ```sh
    npx prisma migrate dev
    ```

## Available Scripts

In the project directory, you can run the following commands:

### `npm run dev`

Runs the app in development mode.
It will automatically restart the server if you make changes to the files.
The server will be running at `http://localhost:PORT` (the port depends on your configuration).

### `npm run seed`

Runs the database seed script located in `prisma/seed.ts` to populate your database with initial data.

### `npm test`

Currently, there are no tests configured for this project.