# 2FLocal: Architecture and Description

## 1. Application Description

**2FLocal** is envisioned as a cross-platform two-factor authentication (2FA) application, designed to provide functionality similar to Google Authenticator or Duo Mobile. It allows users to securely store and manage Time-Based One-Time Password (TOTP) secrets for various online services.

**Core Goals:**

*   **TOTP Generation:** Generate standard TOTP codes based on stored secrets.
*   **Secure Storage:** Protect sensitive TOTP secrets both at rest and in transit.
*   **Cross-Device Synchronization:** Enable users to access their 2FA accounts seamlessly across multiple registered devices (iOS, Android initially, potentially Web/Desktop later).
*   **Device Management:** Allow users (and potentially administrators) to manage (view, revoke) devices linked to their account via an integrated admin panel within the app.
*   **User Authentication:** Secure user registration and login to access the application and synchronized secrets.

## 2. System Architecture

2FLocal employs a standard client-server architecture.

```mermaid
graph TD
    subgraph User Devices
        direction LR
        MobileApp[Mobile App (React Native)]
        WebApp[Web App (Future)]
        DesktopApp[Desktop App (Future)]
    end

    subgraph Backend Infrastructure
        direction TB
        BackendAPI[Backend API (Node.js/Express/TypeScript)] --> DBLayer[Database Layer]
        DBLayer -- Prisma ORM --> DB[(PostgreSQL DB)]
    end

    MobileApp --> BackendAPI
    WebApp --> BackendAPI
    DesktopApp --> BackendAPI

    style BackendAPI fill:#f9f,stroke:#333,stroke-width:2px
    style MobileApp fill:#ccf,stroke:#333,stroke-width:2px
    style DB fill:#ccf,stroke:#333,stroke-width:2px
```

### 2.1 Frontend (Client)

*   **Technology:** React Native (planned for initial iOS/Android versions).
*   **Responsibilities:**
    *   User Interface (UI) for managing accounts and viewing TOTP codes.
    *   QR Code scanning for adding new accounts.
    *   Secure local storage (details TBD, potentially encrypted storage).
    *   Communication with the Backend API for authentication, synchronization, and device management.
    *   TOTP code generation based on fetched secrets.
    *   Admin panel interface for device management.

### 2.2 Backend (Server)

*   **Technology:** Node.js with Express.js framework, written in TypeScript.
*   **Responsibilities:**
    *   Provides a RESTful API for clients.
    *   User authentication (registration, login) using email/password and JWT tokens.
    *   CRUD operations for user accounts, linked devices, and stored account secrets.
    *   Authorization checks (ensuring users only access their own data, admin checks).
    *   Interaction with the PostgreSQL database via the Prisma ORM.
    *   Encryption/decryption of sensitive account secrets before storing/retrieving.

*   **Directory Structure (`/backend`):**
    *   `src/`: TypeScript source code.
        *   `index.ts`: Server entry point, Express app setup, middleware configuration, Prisma client initialization.
        *   `controllers/`: Logic for handling API requests (e.g., `authController.ts`, `accountController.ts`, `deviceController.ts`, `adminController.ts`).
        *   `routes/`: Defines API endpoints and maps them to controller functions (e.g., `auth.ts`, `accounts.ts`, `devices.ts`, `admin.ts`).
        *   `middleware/`: Custom middleware functions (e.g., `authenticateToken.ts` for JWT validation, `checkAdmin.ts`).
        *   `utils/`: Utility functions (e.g., `encryption.ts` for handling secret encryption/decryption).
    *   `prisma/`: Database schema, migrations, and generated Prisma client.
        *   `schema.prisma`: Defines database models and relations.
        *   `migrations/`: Database migration history.
        *   `src/generated/prisma`: Auto-generated Prisma client code.
    *   `dist/`: Compiled JavaScript code (output of `tsc`).
    *   `node_modules/`: Project dependencies.
    *   `.env`: Environment variables (database URL, JWT secret, port, etc.).
    *   `package.json`: Project metadata, dependencies, and scripts.
    *   `tsconfig.json`: TypeScript compiler options.
    *   `nodemon.json`: Development server configuration for `nodemon`.
    *   `docker-compose.yml`: Defines services needed for development (e.g., PostgreSQL database).

*   **Authentication:**
    *   Password hashing uses `bcrypt`.
    *   Session management uses JSON Web Tokens (JWT), signed with a secret stored in environment variables.
    *   Tokens contain `userId`, `email`, and `isAdmin` status.
    *   `authenticateToken` middleware protects relevant API routes.

*   **Secret Handling:**
    *   TOTP secrets are **never** stored in plaintext in the database.
    *   They are encrypted using AES-256-GCM (via `src/utils/encryption.ts`) before being saved to the `AccountSecret` table.
    *   The encryption key should be securely managed via environment variables.

### 2.3 Database

*   **Technology:** PostgreSQL.
*   **ORM:** Prisma Client.
*   **Schema (`prisma/schema.prisma`):**
    *   **`User`**: Stores user information (id, email, passwordHash, isAdmin flag, timestamps). Relations to `Device` and `AccountSecret`.
    *   **`Device`**: Represents a user's registered device (id, identifier, name, type, lastSeen, timestamps). Relation to `User`. Includes a unique constraint on `userId` + `identifier`.
    *   **`AccountSecret`**: Stores the details for a 2FA account (id, issuer, label, encryptedSecret, iv, authTag, timestamps). Relation to `User`. Includes a unique constraint on `userId` + `issuer` + `label`.
    *   **`DeviceType` (Enum)**: Defines allowed device types (`MOBILE`, `DESKTOP`, `WEB`, `OTHER`).
*   **Migrations:** Managed using `prisma migrate dev`.

### 2.4 Development Environment

*   **Database:** A PostgreSQL instance is run locally using Docker via `docker-compose.yml`.
*   **Server:** The Node.js backend server is run during development using `nodemon` for auto-reloading (`npm run dev`), which compiles TypeScript (`tsc`) and runs the compiled JavaScript (`node ./dist/index.js`).
*   **Configuration:** Environment variables are managed using a `.env` file and loaded by the `dotenv` package.

