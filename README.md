# TaskAssignmentapp
A web application for managing developer task assignment.

## Tech Stack

### Backend - NestJS

**NestJS** is a progressive Node.js framework (Built on top of Express) for building efficient and scalable server-side applications. It's chosen for this project due to several key advantages e..g., enables tyscript, modular architecture for building apis, dependency injection. 

#### Key Dependencies:

**ORM - MikroORM** (`@mikro-orm/core`, `@mikro-orm/postgresql`)
- Modern TypeScript ORM for Node.js based on Data Mapper pattern
- Type-safe database queries with excellent TypeScript support

**AI Integration - Google Gemini** (`@google/genai`)
- Google's advanced generative AI model integration
- Provides smart recommendations for optimal task allocation

**Other Key Packages:**
- `@nestjs/config`: Environment configuration management
- `class-validator` & `class-transformer`: DTO validation and transformation
- `reflect-metadata`: Enables decorator functionality

### Frontend - React with Vite

**React** is a powerful JavaScript library for building user interfaces, while **Vite** is a modern build tool that provides an exceptional development experience e.g., component-based & typescript development, optimized builds and production ready.

#### Key Dependencies:

**UI Framework - Bootstrap** (`bootstrap`)
- Popular CSS framework for responsive design
- Pre-built components for rapid development

**HTTP Client - Axios** (`axios`)
- Promise-based HTTP client for API communication
- Easy configuration for base URLs and headers

**Core Libraries:**
- `react` & `react-dom`: Core React library for building UI components
- `typescript`: Static type checking for safer code
- `vite`: Next-generation frontend build tool

### Database - PostgreSQL 15

**PostgreSQL** is a powerful, open-source relational database chosen for the app.

## Environment Configuration

Before running the application, you need to configure environment variables for the backend service.

### Setting up .env file

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=<enter_password>
DB_NAME=task_assignment

# LLM Configuration
GEMINI_API_KEY=<enter_key>
```

> **Note:** When running with Docker Compose, the environment variables are already defined in `docker-compose.yml` and will override the `.env` file. The `.env` file is primarily for local development outside of Docker.


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

## API Documentation

The backend provides RESTful API endpoints for managing skills, developers, and tasks. All endpoints return JSON responses.

### Skill API

**Get All Skills**
```http
GET http://localhost:3000/skills
```
Returns a list of all available skills in the system.

**Get Skill by ID**
```http
GET http://localhost:3000/skills/1
```
Returns details of a specific skill by ID.

---

### Developer API

**Get All Developers**
```http
GET http://localhost:3000/developers
```
Returns a list of all developers with their assigned skills.

**Get Developer by ID**
```http
GET http://localhost:3000/developers/3
```
Returns details of a specific developer including their skills and assigned tasks.

---

### Task API

#### Create Task

**Create Task with AI (Recommended)**
```http
POST http://localhost:3000/tasks
Content-Type: application/json

{
  "title": "As a resident, I want to be able to pay for my product bookings."
}
```
Creates a new task and uses Google Gemini AI to automatically analyze the task description and identify required skills. The AI will suggest the most suitable developer based on skill matching.

**Create Task Manually**
```http
POST http://localhost:3000/tasks
Content-Type: application/json

{
  "title": "Implement search feature",
  "requiredSkillIds": [2]
}
```
Creates a new task where you manually specify the required skills. Use this when you want direct control over skill requirements without AI assistance.

#### Update Task

**Assign Task to Developer**
```http
PATCH http://localhost:3000/tasks/1
Content-Type: application/json

{
  "assignedDeveloperId": 1
}
```
Assigns the task to a specific developer. The system validates that the developer has the required skills for the task.

**Change Task Status**
```http
PATCH http://localhost:3000/tasks/1
Content-Type: application/json

{
  "status": "In Progress"
}
```
Updates the task status. Available statuses: `Pending`, `In Progress`, `Completed`, `Blocked`.

**Add/Update Required Skills**
```http
PATCH http://localhost:3000/tasks/1
Content-Type: application/json

{
  "requiredSkillIds": [1, 2]
}
```
Updates the required skills for a task. Note: The system validates skill compatibility. For example, trying to add a frontend skill to a backend-focused task may fail validation to maintain task consistency.

#### Get Task

**Get Task Details**
```http
GET http://localhost:3000/tasks/1
```
Returns complete task information including:
- Task title and description
- Current status
- Required skills
- Assigned developer (if any)
- Creation and update timestamps

---

### Response Examples

**Success Response (200 OK)**
```json
{
  "id": 1,
  "title": "Implement search feature",
  "status": "Pending",
  "requiredSkills": [
    { "id": 2, "name": "Backend Development" }
  ],
  "assignedDeveloper": null,
  "createdAt": "2025-10-15T10:30:00Z",
  "updatedAt": "2025-10-15T10:30:00Z"
}
```

**Error Response (400 Bad Request)**
```json
{
  "statusCode": 400,
  "message": "Skill mismatch: Cannot add frontend skills to backend-focused task",
  "error": "Bad Request"
}
```
