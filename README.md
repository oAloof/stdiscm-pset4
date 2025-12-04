# Distributed Online Enrollment System (PSET4)

A distributed microservices-based enrollment system with fault tolerance, built with gRPC, TypeScript, React, and Docker.

## Architecture

This system implements a distributed architecture with 5 separate nodes:

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│  Frontend   │──────→│ API Gateway │──────→│ Auth Service │──────┐
│ (React/TS)  │       │  (REST API) │   │   │ (gRPC:50051) │      │
│   :3000     │       │    :4000    │   │   └──────────────┘      │
└─────────────┘       └─────────────┘   │                         │
                                        │   ┌──────────────┐      │
                                        ├──→│Course Service│──────┤
                                        │   │ (gRPC:50052) │      │
                                        │   └──────────────┘      │
                                        │                         ▼
                                        │   ┌──────────────┐   ┌──────────────┐
                                        └──→│Grade Service │──→│   Supabase   │
                                            │ (gRPC:50053) │   │ (PostgreSQL) │
                                            └──────────────┘   └──────────────┘
```

### Network Configuration

Each service runs in its own Docker container with explicit IP addresses on a custom bridge network (`172.20.0.0/16`):

| Service | IP Address | Port | Protocol |
|---------|-----------|------|----------|
| Frontend | 172.20.0.10 | 3000 | HTTP |
| API Gateway | 172.20.0.20 | 4000 | REST/HTTP |
| Auth Service | 172.20.0.30 | 50051 | gRPC |
| Course Service | 172.20.0.40 | 50052 | gRPC |
| Grade Service | 172.20.0.50 | 50053 | gRPC |

## Project Structure

```
pset4/
├── packages/
│   ├── proto/                 # gRPC service definitions
│   ├── shared-types/          # Shared TypeScript types
│   ├── frontend/              # React frontend (Node 1)
│   ├── api-gateway/           # REST → gRPC gateway (Node 2)
│   ├── auth-service/          # Authentication service (Node 3)
│   ├── course-service/        # Course management service (Node 4)
│   └── grade-service/         # Grade management service (Node 5)
├── docker-compose.yml         # Docker network & services
├── .env.example               # Environment variables template
└── package.json               # Root workspace
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Supabase account (for PostgreSQL database)

### Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials and JWT secret
   ```

3. **Build all packages:**
   ```bash
   npm run build
   ```

### Running with Docker

```bash
# Start all services
docker-compose up --build

# Stop a specific service (to demonstrate fault tolerance)
docker stop course-service

# View network configuration
docker network inspect pset4_network

# Check service IP addresses
docker exec auth-service ip addr show
```

### Running Locally (Development)

```bash
# Terminal 1: Auth Service
cd packages/auth-service
npm run dev

# Terminal 2: Course Service
cd packages/course-service
npm run dev

# Terminal 3: Grade Service
cd packages/grade-service
npm run dev

# Terminal 4: API Gateway
cd packages/api-gateway
npm run dev

# Terminal 5: Frontend
cd packages/frontend
npm run dev
```
## Database Schema

The system uses Supabase PostgreSQL with the following tables:

- **users**: Student and faculty accounts
- **courses**: Available courses
- **sections**: Course sections (1 faculty per section, multiple sections per course)
- **enrollments**: Student enrollments in sections
- **grades**: Student grades per section

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **API Gateway**: Express + gRPC clients
- **Services**: Node.js + gRPC + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT
- **Deployment**: Docker + Docker Compose
- **Communication**: gRPC (services), REST (frontend↔gateway)

## Database Redundancy

This system is designed to support database redundancy via **Supabase Read Replicas**. With a Pro plan or higher, you can:

1. **Deploy Read Replicas** in multiple regions for data redundancy
2. **Load balance** read queries across replicas while writes go to the primary
3. **Reduce latency** by placing replicas closer to users

### Enabling Read Replicas (Pro Plan Required)

1. Go to Supabase Dashboard → **Settings** → **Infrastructure**
2. Click **Deploy Read Replica**
3. Select your preferred region(s)


### Current Configuration

- **Primary Database**: Single Supabase PostgreSQL instance
- **Backups**: Automatic daily backups (included in free tier)
- **Point-in-Time Recovery**: Available on Pro plan
