# Surevenir Backend Service

Surevenir Backend Service is the backend infrastructure for the Surevenir application, built using **TypeScript**, **Express**, and **Prisma ORM**. This project provides APIs to handle the business logic and database operations, ensuring a robust backend for the Surevenir app.

## Features

- **TypeScript Integration**: Ensures a statically-typed codebase for better maintainability.
- **Express Framework**: A flexible and lightweight web server for handling API routes.
- **Prisma ORM**: Simplifies database access and management with an intuitive schema-based approach.
- Modular folder structure for scalability and maintainability.
- Environment-based configuration using `.env` for secure and portable setups.

## Project Structure

The project is structured into distinct folders for better organization:

```
src/
├── config/      # Configuration files for environment setup and database
├── controllers/ # Handles request logic and sends appropriate responses
├── credentials/ # Manages sensitive data like tokens and API keys
├── middlewares/ # Custom middleware (e.g., authentication, logging)
├── routes/      # Defines all API routes
├── services/    # Handles business logic and interacts with controllers
├── types/       # Custom TypeScript type definitions
├── utils/       # Reusable utility functions
└── index.ts     # Main entry point for the backend application
```

## Prerequisites

Ensure the following tools are installed:

- **Node.js** (version 16 or later)
- **npm** (or yarn, if preferred)
- A database supported by Prisma (e.g., PostgreSQL, MySQL, or SQLite)

## Installation

Follow these steps to set up the project locally:

1. Clone this repository:

   ```bash
   git clone <repository-url>
   cd surevenir-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   - Configure environment variables:

   ```bash
   cp example.env .env
   ```

   - Fill in the .env file with your configuration details.

4. Set up the database:

   - Generate Prisma client::

   ```bash
   npx prisma generate
   ```

   - Apply migrations to initialize the database:.

   ```bash
   npx prisma migrate dev
   ```

## Usage

To start the backend server in development mode:

```bash
npm run dev
```

The server will run by default at `http://localhost:5000`.

## API Documentation

`TODO`

## Acknowledgements

Special thanks to all team members for their hard work and dedication to making this project successful.

## Thank You
