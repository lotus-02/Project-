# 🔐 Secure Multi-Tenant Project Management Platform — Backend

> Secure, modular REST API powering authentication, multi-tenancy, authorization, and project management.

---

## 📌 Overview

This directory contains the backend service for the **Secure Multi-Tenant Project Management Platform**.

The backend is responsible for:

* 🔐 Authentication and token management
* 🏢 Multi-tenant data isolation
* 👤 Role-Based Access Control (RBAC)
* 🔑 Permission-based authorization
* 📁 Project management APIs
* 🛡️ Request validation and security middleware
* 🗄️ PostgreSQL database access
* ⚡ Prisma ORM integration

The backend follows a layered architecture to keep authentication, authorization, business logic, database access, and request validation separated.

---

## 🛠️ Technology Stack

| Component             | Technology |
| --------------------- | ---------- |
| Runtime               | Node.js    |
| Framework             | Express.js |
| Database              | PostgreSQL |
| ORM                   | Prisma 7   |
| Authentication        | JWT        |
| Password Hashing      | bcrypt     |
| Validation            | Zod        |
| Security Headers      | Helmet     |
| Cross-Origin Requests | CORS       |
| API Architecture      | REST       |

---

## 🏗️ Backend Architecture

```text
Client
  │
  ▼
REST API
/api/v1
  │
  ▼
Security Middleware
Helmet / CORS
  │
  ▼
Authentication
JWT Verification
  │
  ▼
Tenant Context
Authenticated tenantId
  │
  ▼
Authorization
RBAC / Permissions
  │
  ▼
Validation
Zod Schemas
  │
  ▼
Routes / Controllers
  │
  ▼
Services
Business Logic
  │
  ▼
Prisma ORM
  │
  ▼
PostgreSQL
```

---

## 📁 Project Structure

```text
backend/
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
│
├── src/
│   │
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.routes.js
│   │   └── auth.service.js
│   │
│   ├── config/
│   │   └── prisma.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── tenant.middleware.js
│   │   ├── role.middleware.js
│   │   ├── permission.middleware.js
│   │   ├── validation.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── routes/
│   │   └── project.routes.js
│   │
│   ├── services/
│   │   └── project.service.js
│   │
│   ├── validators/
│   │   └── project.validator.js
│   │
│   ├── utils/
│   │   └── jwt.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

# ⚙️ Local Setup

## 1. Install Dependencies

From the `backend` directory:

```bash
npm install
```

---

## 2. Configure Environment Variables

Create a `.env` file in the backend directory.

```env
PORT=5000
NODE_ENV=development

DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE"

JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

### ⚠️ Security

Never commit the following to Git:

```text
.env
Database passwords
JWT secrets
Access tokens
Refresh tokens
API keys
Private credentials
```

Use `.env.example` for sharing the required configuration structure.

---

# 🗄️ Database & Prisma

The backend uses **PostgreSQL** with **Prisma 7**.

## Generate Prisma Client

```bash
npx prisma generate
```

## Apply Migrations

For an existing database:

```bash
npx prisma migrate deploy
```

During development, when creating a new migration:

```bash
npx prisma migrate dev --name <migration-name>
```

Example:

```bash
npx prisma migrate dev --name add_projects
```

## Seed Permissions

```bash
node prisma/seed.js
```

Current permissions include:

```text
project:create
project:read
project:update
project:delete
```

---

# ▶️ Running the Backend

Start the development server:

```bash
npm run dev
```

The API runs on:

```text
http://localhost:5000
```

---

# 🩺 Health Check

Endpoint:

```http
GET /api/v1/health
```

Example response:

```json
{
  "success": true,
  "message": "Secure Multi-Tenant Backend is running"
}
```

This endpoint can be used to verify that the backend service is running.

---

# 🔐 Authentication

The backend uses **JWT-based authentication**.

## Authentication Flow

```text
Register
   │
   ▼
Hash Password
   │
   ▼
Create Organization
   │
   ▼
Create User
   │
   ▼
Login
   │
   ▼
Verify Password
   │
   ▼
Generate Access Token
   │
   ▼
Generate Refresh Token
   │
   ▼
Access Protected APIs
```

## Register Organization

```http
POST /api/v1/auth/register-organization
```

Creates:

```text
Tenant
 ├── ADMIN Role
 └── User
```

Passwords are stored as bcrypt hashes rather than plaintext.

---

## Login

```http
POST /api/v1/auth/login
```

Successful authentication returns:

```text
Access Token
Refresh Token
User Information
```

Access tokens are short-lived.

Current default:

```text
Access Token → 15 minutes
Refresh Token → 7 days
```

---

## Refresh Access Token

```http
POST /api/v1/auth/refresh
```

The refresh token is verified before generating a new access token.

> Refresh-token rotation and server-side revocation are planned security improvements.

---

# 🏢 Multi-Tenancy

The backend uses a **shared PostgreSQL database with tenant-scoped records**.

Conceptually:

```text
Tenant A
 ├── Users
 ├── Roles
 └── Projects

Tenant B
 ├── Users
 ├── Roles
 └── Projects
```

Every tenant-owned resource contains a `tenantId`.

---

## 🔒 Tenant Isolation

The backend does **not** trust a tenant ID supplied by the client.

Instead:

```text
JWT
 │
 ▼
Verified tenantId
 │
 ▼
Tenant Middleware
 │
 ▼
req.tenantId
 │
 ▼
Database Query
```

Example:

```js
where: {
    id: projectId,
    tenantId: req.tenantId
}
```

This ensures that a user cannot access another tenant's project simply by changing a project ID.

---

# 👤 Authorization

The backend supports permission-based authorization.

Current permissions:

```text
project:create
project:read
project:update
project:delete
```

Protected routes use:

```js
authorizePermission("project:create")
```

Authorization flow:

```text
JWT
 │
 ▼
User Identity
 │
 ▼
Tenant Context
 │
 ▼
User Role
 │
 ▼
Role Permission
 │
 ▼
Allow / Deny
```

Unauthorized requests return:

```http
403 Forbidden
```

---

# 📁 Project API

All project endpoints are protected.

| Method | Endpoint               | Permission       |
| ------ | ---------------------- | ---------------- |
| GET    | `/api/v1/projects`     | `project:read`   |
| POST   | `/api/v1/projects`     | `project:create` |
| GET    | `/api/v1/projects/:id` | `project:read`   |
| PATCH  | `/api/v1/projects/:id` | `project:update` |
| DELETE | `/api/v1/projects/:id` | `project:delete` |

Protected requests require:

```http
Authorization: Bearer <access_token>
```

---

# 🧪 Request Validation

The backend uses **Zod** to validate incoming request data.

Example project validation:

```text
Project Name
 ├── Required
 └── Maximum 100 characters

Description
 └── Maximum 1000 characters
```

Invalid requests return:

```json
{
  "success": false,
  "message": "Validation failed"
}
```

Validation occurs before business logic is executed.

---

# 🛡️ Security Middleware

Current middleware includes:

| Middleware                 | Purpose                    |
| -------------------------- | -------------------------- |
| `auth.middleware.js`       | JWT authentication         |
| `tenant.middleware.js`     | Tenant context             |
| `role.middleware.js`       | Role authorization         |
| `permission.middleware.js` | Permission authorization   |
| `validation.middleware.js` | Request validation         |
| `error.middleware.js`      | Centralized error handling |

The application also uses:

```text
Helmet
CORS
bcrypt
JWT
Zod
Tenant-scoped Prisma queries
```

---

# 🧪 Security Verification

The backend has been verified against key authorization and isolation scenarios.

### Authentication

* [x] Missing token rejected
* [x] Invalid token rejected
* [x] Expired token rejected
* [x] Valid access token accepted

### Multi-Tenancy

* [x] Tenant context derived from authenticated user
* [x] Project queries scoped by tenant
* [x] Cross-tenant project access rejected
* [x] Client cannot choose the tenant context

### Authorization

* [x] Permission middleware implemented
* [x] Unauthorized permission rejected
* [x] ADMIN project permissions verified
* [x] Developer without required permission rejected

### Validation

* [x] Project creation validation
* [x] Project update validation
* [x] Invalid request data rejected

### Project Management

* [x] Create project
* [x] Read projects
* [x] Read project by ID
* [x] Update project
* [x] Delete project

---

# 🌱 Development Workflow

Create a feature branch from `main`:

```bash
git checkout main
git pull
git checkout -b feature/<feature-name>
```

Make changes and verify them locally.

Stage changes:

```bash
git add .
```

Commit:

```bash
git commit -m "feat: <description>"
```

Push:

```bash
git push -u origin feature/<feature-name>
```

Then open a Pull Request against:

```text
main
```

---

# 📋 Development Principles

Backend development should follow these principles:

```text
Security First
     ↓
Authenticate
     ↓
Establish Tenant Context
     ↓
Authorize
     ↓
Validate Input
     ↓
Execute Business Logic
     ↓
Use Tenant-Scoped Database Queries
```

### Important Rules

* Never trust client-supplied `tenantId`
* Never store plaintext passwords
* Never expose secrets in source code
* Authenticate protected requests
* Authorize sensitive operations
* Validate external input
* Scope tenant-owned database queries
* Return only necessary data
* Keep business logic inside service layers
* Keep authentication and authorization separate

---

# 🚧 Backend Development Status

## Completed

* [x] PostgreSQL integration
* [x] Prisma schema
* [x] Prisma migrations
* [x] Organization registration
* [x] Password hashing
* [x] Login
* [x] JWT authentication
* [x] Refresh-token flow
* [x] Authentication middleware
* [x] Tenant middleware
* [x] RBAC foundation
* [x] Permission-based authorization
* [x] Project CRUD
* [x] Tenant-isolated project queries
* [x] Zod request validation
* [x] Security verification

## Planned

* [ ] Centralized error handling integration
* [ ] User management APIs
* [ ] Project membership
* [ ] Task management
* [ ] Audit logging
* [ ] Rate limiting
* [ ] Security test suite
* [ ] Refresh-token rotation
* [ ] Refresh-token revocation
* [ ] API documentation
* [ ] Real-time WebSocket functionality
* [ ] Analytics APIs

---

# 🤝 Backend Contribution

Before submitting backend changes:

```text
1. Create feature branch
2. Implement the change
3. Run the backend locally
4. Test affected APIs
5. Verify tenant isolation
6. Verify authorization
7. Verify validation
8. Commit changes
9. Push branch
10. Open Pull Request
```

Security-sensitive changes should receive additional review before merging.

---

# 📄 License

Refer to the repository root `README.md` and project license for licensing information.

---

<p align="center">
  🔐 Secure Backend · 🏢 Multi-Tenant · 🛡️ Permission-Based · ⚡ REST API
</p>
