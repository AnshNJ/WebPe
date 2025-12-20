# NPCI Mock Server

A mock server that simulates the National Payments Corporation of India (NPCI) payment clearing house for UPI transactions.

## Overview

This server simulates the payment clearing process between PSPs (Payment Service Providers) in a UPI ecosystem. It receives payment requests, validates them, and responds with approval or rejection after a simulated processing delay.

## Features

- Payment processing endpoint (`POST /api/process-payment`)
- Configurable success rate (default: 95%)
- Configurable processing delay (default: 1-3 seconds)
- Request validation
- Health check endpoint
- Request logging

## Setup

1. Install dependencies:
```sh
npm install
```

2. Copy `.env.example` to `.env` and configure:
```sh
cp .env.example .env
```

3. Run the server:
```sh
npm run dev
```

The server will run on `http://localhost:3002` by default.

## Environment Variables

- `PORT` - Server port (default: 3002)
- `SUCCESS_RATE` - Success rate for payments (0.0 to 1.0, default: 0.95)
- `MIN_PROCESSING_DELAY_MS` - Minimum processing delay in milliseconds (default: 1000)
- `MAX_PROCESSING_DELAY_MS` - Maximum processing delay in milliseconds (default: 3000)
- `LOG_LEVEL` - Logging level (default: info)

## API Endpoints

### POST /api/process-payment

Process a payment request from a PSP.

**Request Body:**
```json
{
  "pspTransactionId": "string",
  "amount": 100.50,
  "payerVpa": "user@paytm",
  "payeeVpa": "merchant@upi"
}
```

**Response (Approved):**
```json
{
  "status": "approved",
  "message": "Payment processed successfully",
  "npciTransactionId": "NPCI1234567890123456",
  "processedAt": "2024-01-15T10:30:00.000Z"
}
```

**Response (Rejected):**
```json
{
  "status": "rejected",
  "message": "Insufficient funds",
  "processedAt": "2024-01-15T10:30:00.000Z"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server (requires build first)

## Notes

- This is a mock server for testing purposes
- No database or authentication required
- Processing is synchronous with simulated delay
- Success rate and delay are configurable for testing different scenarios

