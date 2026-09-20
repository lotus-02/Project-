# Software Requirements Specification (SRS)
## Secure Multi-Tenant Project Management Platform with Real-Time Analytics & ML Intelligence

---

### 1. Introduction

#### 1.1 Purpose
This document specifies the software requirements for the **Secure Multi-Tenant Project Management Platform**. The platform is designed for enterprise organizations requiring strict data isolation, granular permission-based access control (PBAC/RBAC), real-time collaboration, and machine learning-driven project risk forecasting.

#### 1.2 Scope
The system provides a SaaS multi-tenant platform comprising:
- **Node.js/Express REST API**: Core business logic, tenant-scoped database queries, JWT authentication, and RBAC authorization.
- **WebSocket Gateway (Socket.io)**: Sub-second state synchronization for tasks, comments, and audit activities.
- **Python ML Intelligence Microservice (FastAPI)**: Statistical and heuristic risk analysis, delay probability estimation, and team capacity optimization.
- **React Single-Page Application (Vite/Tailwind)**: Modern, responsive user interface with Kanban workflows, analytics, and management dashboards.
- **PostgreSQL Database with Prisma ORM**: Unified relational persistence with logical tenant isolation.

---

### 2. Overall Description

#### 2.1 Product Perspective
```text
                                 ☁️ Cloud Platform
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
   🏢 Tenant Alpha                                                  🏢 Tenant Beta
   ├── Users                                                        ├── Users
   ├── Roles & Permissions                                          ├── Roles & Permissions
   ├── Projects & Tasks                                             ├── Projects & Tasks
   └── ML Analytics                                                 └── ML Analytics
```
Each organization constitutes an independent tenant. The underlying database is shared logically, with every business entity partitioned strictly by a verified `tenantId`.

#### 2.2 User Classes and Roles
1. **Tenant Administrator (ADMIN)**: Full organizational control; manages users, roles, project access, and organization settings.
2. **Project Manager (PROJECT_MANAGER)**: Creates and manages projects, assigns tasks, invites project members, and monitors ML analytics.
3. **Team Member (TEAM_MEMBER)**: Views assigned projects, creates and updates tasks, comments on deliverables, and receives live notifications.

---

### 3. Functional Requirements

#### 3.1 Multi-Tenancy & Security
- **FR-SEC-01**: Organization self-service registration must atomically provision a `Tenant`, create an `ADMIN` role with all permissions, and create the root administrator user.
- **FR-SEC-02**: Client-supplied `tenantId` query parameters or headers must be discarded. The authenticated `tenantId` must be derived solely from the cryptographically verified JWT access token.
- **FR-SEC-03**: All database queries accessing tenant-owned resources must enforce a mandatory `where: { tenantId }` constraint.
- **FR-SEC-04**: Passwords must be hashed using `bcrypt` with a work factor of $\ge 12$.

#### 3.2 Authentication & Authorization
- **FR-AUTH-01**: Dual-token architecture using short-lived Access Tokens (15 min) and long-lived Refresh Tokens (7 days).
- **FR-AUTH-02**: Dynamic permission evaluation via `authorizePermission(name)`. Requests without required permissions must return HTTP `403 Forbidden`.

#### 3.3 Project & Task Management
- **FR-PM-01**: Projects support priority levels (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), start/end target dates, and membership assignment.
- **FR-PM-02**: Tasks support states (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`), priority tags, due dates, estimated hours, and actual hours.
- **FR-PM-03**: Collaborative task discussions via threaded comments with user attribution.

#### 3.4 Real-Time Streaming
- **FR-RT-01**: WebSocket connections must authenticate via JWT handshake.
- **FR-RT-02**: Sockets are automatically joined to isolated rooms: `tenant:<tenantId>` and `project:<projectId>`.
- **FR-RT-03**: Task creations, status movements, and audit log entries must broadcast to relevant rooms within 200ms.

#### 3.5 ML Project Intelligence
- **FR-ML-01**: Calculate continuous risk scores ($0-100$) based on deadline compression, overdue task ratio, and completion velocity.
- **FR-ML-02**: Compute delay probability ($0.00-1.00$) for project milestones.
- **FR-ML-03**: Detect team workload imbalances and capacity overload indicators.
- **FR-ML-04**: Generate natural-language recommendations to mitigate delivery delays.

---

### 4. Non-Functional Requirements

- **Performance**: REST API response latency $< 150\text{ms}$ for $95\%$ of queries under normal load.
- **Reliability**: Graceful fallback heuristics in backend if Python ML microservice is unreachable.
- **Maintainability**: Clear separation of concerns (Routes $\to$ Controllers $\to$ Services $\to$ Prisma ORM).
