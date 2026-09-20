# System Architecture & Technical Design
## Secure Multi-Tenant Project Management Platform with Real-Time Analytics

---

### 1. High-Level Architecture

The platform adopts a decoupled service-oriented architecture:

```mermaid
graph TD
    Client["React 18 SPA (Vite + Tailwind)"]
    
    subgraph Backend_Gateway ["Node.js API & Gateway"]
        AuthMiddleware["JWT & Security Middleware"]
        TenantContext["Tenant Isolation Middleware"]
        RBAC["PBAC / RBAC Evaluator"]
        SocketEngine["Socket.io Real-Time Engine"]
        RESTControllers["Domain REST Controllers"]
    end
    
    subgraph Data_Tier ["Data & Inference Layer"]
        Postgres[("PostgreSQL Database (Prisma 7)")]
        MLService["Python ML Microservice (FastAPI)"]
    end
    
    Client -->|"REST / HTTPS"| AuthMiddleware
    Client <-->|"WebSocket / WSS"| SocketEngine
    AuthMiddleware --> TenantContext
    TenantContext --> RBAC
    RBAC --> RESTControllers
    RESTControllers -->|"Tenant-Scoped Queries"| Postgres
    RESTControllers -->|"Feature Vector Ingestion"| MLService
    MLService -->|"Inference & Risk Analytics"| RESTControllers
    RESTControllers -->|"State Broadcast"| SocketEngine
```

---

### 2. Multi-Tenant Security & Isolation Model

Tenant isolation is guaranteed by strict server-side boundary enforcement:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as React Client
    participant MW as Tenant & Auth Middleware
    participant Service as Business Service
    participant DB as PostgreSQL (Prisma)

    User->>Client: Perform Action (e.g. Move Task)
    Client->>MW: HTTP Request + Bearer JWT
    Note over MW: 1. Validate JWT signature<br/>2. Extract verified tenantId<br/>3. Discard any client-sent tenantId
    MW->>Service: req.tenantId, req.user
    Service->>DB: prisma.task.update({ where: { id, tenantId } })
    Note over DB: Query strictly scoped to tenantId<br/>Cross-tenant access impossible
    DB-->>Service: Updated Record
    Service-->>Client: 200 OK + JSON Response
```

---

### 3. Real-Time Collaboration Flow

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Dev Alice (Tenant A)
    actor Bob as Dev Bob (Tenant A)
    participant Socket as Socket.io Server
    participant DB as Database

    Alice->>Socket: Connect + Auth Token
    Bob->>Socket: Connect + Auth Token
    Note over Socket: Sockets join room "tenant:Tenant-A"
    Alice->>Socket: Emit "project:join" (Project-1)
    Bob->>Socket: Emit "project:join" (Project-1)
    
    Alice->>DB: Advance Task to IN_PROGRESS
    DB-->>Socket: Trigger Real-Time Notification
    Socket->>Bob: Event "task:updated"
    Note over Bob: Task card smoothly animates to IN_PROGRESS
```

---

### 4. Machine Learning Project Intelligence Pipeline

```mermaid
graph LR
    subgraph Input_Features ["1. Feature Extraction"]
        T["Task Counts & States"]
        O["Overdue Ratio"]
        D["Deadline Proximity"]
        W["Member Workload"]
    end

    subgraph ML_Microservice ["2. FastAPI ML Engine"]
        FE["Feature Normalization"]
        RE["Risk Scoring Engine"]
        DP["Delay Probability Predictor"]
        WL["Workload Capacity Evaluator"]
        REC["AI Recommendation Generator"]
    end

    subgraph Output_Artifacts ["3. Persistent Insights"]
        MLSnapshot[("MLAnalysis Record")]
        Dashboard["React AI Dashboard"]
    end

    Input_Features --> FE
    FE --> RE & DP & WL
    RE & DP & WL --> REC
    REC --> MLSnapshot
    MLSnapshot --> Dashboard
```

---

### 5. Deployment Topology

The platform supports containerized and standalone deployments:
- **Frontend**: Static SPA hosted via Vercel, Netlify, or Nginx.
- **Backend**: Node.js container (Port `5000`) with horizontal autoscaling.
- **ML Service**: Python Uvicorn container (Port `8000`).
- **Persistence**: Managed PostgreSQL 15+ instance with connection pooling.
