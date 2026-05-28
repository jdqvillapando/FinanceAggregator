# FinanceAggregator - Enterprise Distributed Wealth Management System

FinanceAggregator is an ongoing project that aims to create a production-grade, event-driven microservices ecosystem designed as a comprehensive wealth management hub. The platform allows users to aggregate, monitor, and execute financial operations across traditional banking systems and decentralized cryptocurrency asset portfolios within a single secured environment.

---

## Architecture Overview

The system is engineered utilizing an decoupled microservices topology enclosed behind a central API Gateway. It enforces strict domain context isolation, asynchronous transactional processing pipelines, distributed caching architectures, and robust multi-schema data segregation.

                                                  [ Public Internet ]
                                                           │  (HTTPS / WSS)
                                                           ▼
                                               ┌───────────────────────┐
                                               │     YarpGateway       │  (CORS Termination / Reverse Proxy)
                                               └───────────┬───────────┘
                                                           │
                                 ┌─────────────────────────┼─────────────────────────┐
                                 │ (Internal HTTP)         │ (Internal HTTP)         │ (WebSockets / SignalR)
                                 ▼                         ▼                         ▼
                         ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
                         │    IdentityService    │ │     WalletService     │ │    SignalR Backplane  │
                         │   (identity_schema)   │ │    (wallet_schema)    │ │   (Real-Time Streaming)
                         └───────────┬───────────┘ └───────────┬───────────┘ └───────────┬───────────┘
                                     │                         │                         │
                                     │      ┌───────────┐      │      ┌───────────┐      │
                                     └─────►│  Redis    │◄─────┴─────►│ RabbitMQ  │◄─────┘
                                            │ (Caching) │             │ (Message) │
                                            └───────────┘             └───────────┘

### System Technology Stack
* **API Gateway & Routing:** YARP (Yet Another Reverse Proxy), Docker virtual bridge private networking.
* **Core Backend Engines:** C# / .NET 10 Web APIs, Entity Framework Core 10 (Eager Loading and Fluent Schema Configuration patterns).
* **Enterprise Database Cluster:** Centralized PostgreSQL 16 engine utilizing strictly isolated execution namespaces (`identity_schema` and `wallet_schema`).
* **Asynchronous Messaging Bus:** RabbitMQ Broker utilizing MassTransit orchestration for eventually consistent state propagation and decoupled background event consumer workers.
* **Distributed Cache Tier:** High-throughput Redis Cache-Aside (Lazy Loading) architecture securing reactive asset read paths and minimizing raw database connection pools.
* **Real-Time Streaming Layer:** Persistent WebSockets backed by ASP.NET Core SignalR pushing immediate aggregate ledger balance updates directly to the client view without manual dashboard polling.
* **Modern Frontend Tier:** React, TypeScript, Redux Toolkit normalized state machines, and Tailwind CSS layout design.

---

## System Prerequisites

Before executing the boot sequence, verify that your host system has the following core utilities installed:
1.  **Operating System:** Windows 10/11, macOS, or a standard Linux distribution.
2.  **Containerization Runtime:** Docker Desktop v4.20+ or Docker Engine with the standalone `docker-compose-plugin`.
3.  **Local Tools (Optional, for native development/debugging):**
    * .NET 10 SDK
    * Node.js v20+ & npm v10+
4.  **Database Client (Optional visual schema inspection):** pgAdmin 4 or DBeaver.

---

## Orchestration Boot and Runtime Instructions

The entire platform is fully containerized. There is zero requirement to manually download or set up local instances of PostgreSQL, RabbitMQ, or Redis on your host operating system.

### 1. Fresh Cluster Boot Configuration
To execute an atomic, pristine spin-up of all infrastructure layers, backing datastores, background message queues, and core microservice runtimes from scratch, run the following command within the root repo path:

```bash
docker compose down --volumes --remove-orphans
docker compose up --build -d
```
_Note: The `--volumes` flag ensures that any stale historical datastores or caching states are completely flushed, forcing the PostgreSQL cluster engine to cleanly generate its isolated microservice schemas natively on initial boot._

### 2. Standard Infrastructure Lifecycle Management
To stop the workspace container cluster gracefully without destroying your active data tables, user accounts, cache keys, or event ledger history:

```bash
docker compose down
```

To boot the existing ecosystem back online instantly without running heavy multi-stage code compilation cycles:

```bash
docker compose up -d
```

### 3. Service Verification Endpoints
Once the runtime containers show a healthy or running status inside your container dashboard, they map cleanly to the following host endpoints via the YARP Entry Gateway:
* **API Gateway Reverse Proxy System Entry:** `http://localhost:5153`
* **Central Authentication Engine Swagger Docs:** `http://localhost:5153/swagger/index.html` (Routed to Identity Context)
* **Core Ledger Financial Swagger Docs:** `http://localhost:5153/swagger/index.html` (Routed to Wallet Context)
* **RabbitMQ Management Control Panel:** `http://localhost:15672` (Credentials: guest / guest)
* **Frontend UI Client Workspace Dashboard:** `http://localhost:3000`

---

## Monorepo Workspace Directory Blueprint
    FinanceAggregator/
    ├── .github/
    │   └── workflows/              # Path-isolated continuous integration automation pipelines
    ├── src/
    │   ├── YarpGateway/            # Gateway Proxy layer enforcing CORS, routing, & proxy policies
    │   ├── IdentityService/        # Secured Authentication context managing user namespaces
    │   ├── WalletService/          # Core transactional ledger engine and balance schemas
    │   └── FinanceAggregator.Web/  # High-performance React, TypeScript & Redux view engine
    ├── docker-compose.yml          # Master infrastructure, database, and event orchestration script
    ├── FinanceAggregator.sln       # Monorepo cross-service solution compilation manifest
    └── README.md
