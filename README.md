# taskassignmentapp
A web application for managing developer task assignment.

## Docker Deployment

This application uses Docker and Docker Compose to orchestrate multiple containers for easy deployment and development.

### Architecture Overview

The application consists of three main services defined in `docker-compose.yml`:

1. **Database** (PostgreSQL 15)
   - Runs on port `5433:5432`
   - Stores all application data including tasks, developers, and skills
   - Automatically initializes schema from `database/script.sql`
   - Includes health checks to ensure database is ready before starting dependent services

2. **Backend** (NestJS API)
   - Runs on port `3000:3000`
   - Built using the Dockerfile in `backend/Dockerfile`
   - Connects to PostgreSQL database
   - Provides REST API endpoints for task management
   - Integrated with Gemini AI for intelligent task assignment
   - Waits for database health check before starting

3. **Frontend** (React + Vite)
   - Runs on port `80:80`
   - Built using the Dockerfile in `frontend/Dockerfile`
   - Served through Nginx web server
   - Provides user interface for task management
   - Waits for backend health check before starting

### How It Works

Each service has its own Dockerfile:

- **Backend Dockerfile** (`backend/Dockerfile`):
  - Uses Node.js 18 Alpine image for minimal size
  - Installs dependencies and builds the NestJS application
  - Exposes port 3000 for API access
  - Runs the production build

- **Frontend Dockerfile** (`frontend/Dockerfile`):
  - Multi-stage build process:
    - Stage 1: Builds the React application using Node.js
    - Stage 2: Serves static files using Nginx
  - Uses custom nginx configuration for routing
  - Exposes port 80 for web access

The `docker-compose.yml` file orchestrates all three services:
- Creates a shared network (`app-network`) for inter-service communication
- Defines environment variables for database connection and API keys
- Sets up volume for persistent database storage
- Configures health checks and service dependencies
- Maps container ports to host ports

### Running the Application

To start all services with Docker Compose:

```bash
docker-compose up --build
```

This command will:
1. Build Docker images for frontend and backend using their respective Dockerfiles
2. Pull the PostgreSQL image from Docker Hub
3. Create and start all three containers
4. Initialize the database with the schema
5. Start the backend API once the database is healthy
6. Start the frontend once the backend is healthy

To run in detached mode (background):

```bash
docker-compose up --build -d
```

### Accessing the Application

Once all containers are running:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Database**: localhost:5433 (PostgreSQL)
