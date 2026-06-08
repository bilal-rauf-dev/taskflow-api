<div align="center">

<br/>

# TaskFlow

![Node.js](https://img.shields.io/badge/Node.js-0f172a?style=for-the-badge&logo=nodedotjs&logoColor=6DB33F)&nbsp;
![Express](https://img.shields.io/badge/Express-0f172a?style=for-the-badge&logo=express&logoColor=white)&nbsp;
![MongoDB](https://img.shields.io/badge/MongoDB-0f172a?style=for-the-badge&logo=mongodb&logoColor=47A248)&nbsp;
![React](https://img.shields.io/badge/React-0f172a?style=for-the-badge&logo=react&logoColor=61DAFB)&nbsp;
![Vite](https://img.shields.io/badge/Vite-0f172a?style=for-the-badge&logo=vite&logoColor=646CFF)&nbsp;
![TailwindCSS](https://img.shields.io/badge/Tailwind-0f172a?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)&nbsp;
![JWT](https://img.shields.io/badge/JWT-0f172a?style=for-the-badge&logo=jsonwebtokens&logoColor=FB015B)&nbsp;
![Swagger](https://img.shields.io/badge/Swagger-0f172a?style=for-the-badge&logo=swagger&logoColor=85EA2D)

<br/>

A complete full-stack task management platform with JWT authentication, role-based access control, task CRUD operations, Swagger docs, and a polished responsive UI.

<br/>

</div>

---

## Tech Stack

| Layer | Technology |
|---|---|
| ![Node.js](https://img.shields.io/badge/Backend-0f172a?style=flat-square) | Node.js, Express.js |
| ![Frontend](https://img.shields.io/badge/Frontend-0f172a?style=flat-square) | React, Vite, Tailwind CSS |
| ![Database](https://img.shields.io/badge/Database-0f172a?style=flat-square) | MongoDB, Mongoose |
| ![Auth](https://img.shields.io/badge/Auth-0f172a?style=flat-square) | JWT, bcryptjs |
| ![Docs](https://img.shields.io/badge/Docs-0f172a?style=flat-square) | Swagger UI, swagger-jsdoc |

---

## Prerequisites

![Node](https://img.shields.io/badge/Node.js-18+-6DB33F?style=flat-square&logo=nodedotjs&logoColor=white)&nbsp;
![MongoDB](https://img.shields.io/badge/MongoDB-required-47A248?style=flat-square&logo=mongodb&logoColor=white)&nbsp;
![npm](https://img.shields.io/badge/npm-required-CB3837?style=flat-square&logo=npm&logoColor=white)

---

## Setup

### Backend

```bash
# Install dependencies
cd backend
npm install

# Configure environment
copy .env.example .env

# Start development server
npm run dev

# Seed demo data
npm run seed
```

### Frontend

```bash
# In a second terminal
cd frontend
npm install
npm run dev
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Express server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/intern_db` |
| `JWT_SECRET` | JWT signing secret | `your_super_secret_key` |
| `JWT_EXPIRES_IN` | JWT expiration duration | `7d` |
| `NODE_ENV` | Runtime environment | `development` |

---

## API Reference

**Base URL:** `http://localhost:5000/api/v1`

#### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| ![POST](https://img.shields.io/badge/POST-22c55e?style=flat-square&logoColor=white) | `/auth/register` | — | Register a new user |
| ![POST](https://img.shields.io/badge/POST-22c55e?style=flat-square&logoColor=white) | `/auth/login` | — | Login and receive JWT |
| ![GET](https://img.shields.io/badge/GET-3b82f6?style=flat-square&logoColor=white) | `/auth/me` | Required | Fetch authenticated user |

#### Tasks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| ![GET](https://img.shields.io/badge/GET-3b82f6?style=flat-square&logoColor=white) | `/tasks` | Required | Get tasks (all if admin) |
| ![POST](https://img.shields.io/badge/POST-22c55e?style=flat-square&logoColor=white) | `/tasks` | Required | Create a new task |
| ![GET](https://img.shields.io/badge/GET-3b82f6?style=flat-square&logoColor=white) | `/tasks/:id` | Required | Get one task by ID |
| ![PUT](https://img.shields.io/badge/PUT-f59e0b?style=flat-square&logoColor=white) | `/tasks/:id` | Required | Update a task |
| ![DELETE](https://img.shields.io/badge/DELETE-ef4444?style=flat-square&logoColor=white) | `/tasks/:id` | Required | Delete a task |
| ![GET](https://img.shields.io/badge/GET-3b82f6?style=flat-square&logoColor=white) | `/tasks/admin/all` | Admin only | All tasks with owner info |

---

## Default Credentials

> Run `npm run seed` after connecting MongoDB to populate these accounts and five sample tasks.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@admin.com` | `admin123` |
| User | `test@test.com` | `test123` |

---

## Docs & Testing

**Swagger UI:** `http://localhost:5000/api/docs`

**Postman:** Import [`postman_collection.json`](postman_collection.json) — includes environment variables, folder organization, and sample requests for auth, tasks, and admin endpoints.

---

## Scalability Notes

The backend can be placed behind an Nginx reverse proxy or cloud load balancer for horizontal scaling, zero-downtime deployments, and improved throughput.

**Redis** is a natural next step for caching frequently accessed data, auth metadata, and rate-limit state — reducing repeated reads against MongoDB.

**MongoDB Atlas** with replica sets provides high availability, automated backups, and a seamless path from local development to a production-managed cluster.

**Docker & Docker Compose** can package all services into reproducible containers. As the product grows, the monolith can be split into dedicated Auth, Task, and Notification services. Rate limiting and input validation are already in place as the baseline security layer for that path.
