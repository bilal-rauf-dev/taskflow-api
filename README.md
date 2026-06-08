# Intern Assignment API + Task Dashboard

A complete full-stack task management platform built with a Node.js/Express/MongoDB backend and a React/Vite/Tailwind frontend. It includes JWT authentication, role-based access control, task CRUD, Swagger docs, and a polished responsive UI.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Frontend | React, Vite, Tailwind CSS |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Docs | Swagger UI, swagger-jsdoc |

## Prerequisites

- Node.js 18+ 
- MongoDB
- npm

## Setup Instructions

### 1. Backend Setup
1. Open a terminal in the backend folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment example file:
   ```bash
   copy .env.example .env
   ```
4. Update the values in `.env` if needed.
5. Start the backend in development mode:
   ```bash
   npm run dev
   ```
6. Seed the database with demo users and tasks:
   ```bash
   npm run seed
   ```

### 2. Frontend Setup
1. Open a second terminal in the frontend folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

## Environment Variables

| Name | Description | Example |
|---|---|---|
| PORT | Port used by the Express server | 5000 |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/intern_db |
| JWT_SECRET | Secret used to sign JWTs | your_super_secret_key |
| JWT_EXPIRES_IN | JWT expiration duration | 7d |
| NODE_ENV | Runtime environment | development |

## API Endpoints

Base URL: `http://localhost:5000/api/v1`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | /auth/register | No | Register a new user |
| POST | /auth/login | No | Login and receive JWT |
| GET | /auth/me | Yes | Fetch current authenticated user |
| GET | /tasks | Yes | Get tasks for current user, or all for admin |
| POST | /tasks | Yes | Create a new task |
| GET | /tasks/:id | Yes | Get one task by id |
| PUT | /tasks/:id | Yes | Update a task by id |
| DELETE | /tasks/:id | Yes | Delete a task by id |
| GET | /tasks/admin/all | Yes, Admin Only | Get all tasks with owner info |

## Default Credentials

Created by the seed script:

- Admin: `admin@admin.com` / `admin123`
- Test user: `test@test.com` / `test123`

Run the seed script after connecting MongoDB to populate these accounts and five sample tasks.

## Swagger Docs

Open the API docs at:

`http://localhost:5000/api/docs`

## Postman Collection

A ready-to-import collection is included at [postman_collection.json](postman_collection.json). It includes environment variables, folder organization, and sample requests for auth, tasks, and admin endpoints.

## Scalability Notes

This application is structured to scale beyond a single development deployment. The backend can be placed behind an Nginx reverse proxy or cloud load balancer so multiple Node.js instances can run horizontally and share traffic. That approach helps with availability, throughput, and safer zero-downtime deployments.

Redis is a natural next step for caching frequently accessed data, short-lived auth metadata, and shared rate-limit or session-related state. That reduces repeated reads against MongoDB and makes the system more responsive under load.

MongoDB Atlas with replica sets gives the database layer high availability, automated backups, and easier cloud operations. It also simplifies moving from a local developer database to a production-ready managed cluster without changing the application data model.

For deployment consistency, Docker and Docker Compose can package the backend, frontend, and supporting services into reproducible containers. As the product grows, the monolith can be split into dedicated services such as an Auth Service, Task Service, and Notification Service. Rate limiting and input validation are already in place here as the baseline security and abuse-control layer for that scale-out path.
