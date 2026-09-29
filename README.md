# 🎬 FrameLog

> **The Social Film Diary & Tracker for Cinephiles.** Track films you’ve watched, save those you want to see, craft curated lists, and share your cinematic journey with friends.

FrameLog is an open-source, full-stack web application inspired by Letterboxd — built from scratch without third-party BaaS platforms like Firebase, Supabase, or Auth0.

---

## 🚀 Tech Stack

### Frontend (`client/`)
- **Core:** [React 19](https://react.dev/) + [Vite](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with custom cinematic dark palette
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **HTTP Client:** [Axios](https://axios-http.com/) with centralized interceptors

### Backend (`server/`)
- **Runtime:** [Node.js](https://nodejs.org/) (LTS v24)
- **Framework:** [Express](https://expressjs.com/) + [TypeScript](https://www.typescriptlang.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Security:** [Helmet](https://helmetjs.github.io/), [CORS](https://github.com/expressjs/cors), [Zod](https://zod.dev/)
- **Logging:** [Morgan](https://github.com/expressjs/morgan) & structured logger
- **Runner:** [tsx](https://github.com/privatenumber/tsx) for fast TypeScript execution and watch mode

### Planned Stack & Architecture
- **Authentication:** Custom JWT (Access Tokens + HTTP-only Refresh Tokens) with `bcryptjs`
- **Real-time:** [Socket.IO](https://socket.io/) for live movie discussions and direct messaging

---

## 📁 Repository Structure

```text
framelog/
├── client/                     # Frontend React + Vite application
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── api/                # API client and service endpoints
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Buttons, cards, badges
│   │   │   └── layout/         # Navbar, Footer, MainLayout
│   │   ├── hooks/              # Custom React hooks (e.g. useHealthCheck)
│   │   ├── lib/                # Shared utilities (Tailwind cn helper)
│   │   ├── pages/              # Route view pages (Home, NotFound, etc.)
│   │   ├── store/              # Client application state
│   │   ├── types/              # TypeScript interfaces (User, Movie, API)
│   │   ├── App.tsx             # Route declarations
│   │   ├── index.css           # Tailwind v4 import & custom theme tokens
│   │   └── main.tsx            # DOM root mounting
│   ├── .env.example            # Sample client environment variables
│   ├── package.json
│   ├── tsconfig.app.json
│   └── vite.config.ts          # Vite config with Tailwind & path aliases
│
├── server/                     # Backend Express + Prisma API
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (PostgreSQL & User model)
│   ├── src/
│   │   ├── controllers/        # Request controllers (e.g. HealthController)
│   │   ├── middleware/         # Centralized error handler & 404 handler
│   │   ├── prisma/             # Singleton Prisma client instance
│   │   ├── routes/             # Express API routes (/api/health, etc.)
│   │   ├── services/           # Business logic layer
│   │   ├── types/              # Server TypeScript interfaces
│   │   ├── utils/              # Standardized API responses & logger
│   │   ├── app.ts              # Express application configuration
│   │   └── server.ts           # Server bootstrap & graceful shutdown
│   ├── .env.example            # Sample server environment variables
│   ├── package.json
│   └── tsconfig.json           # Node.js TypeScript configuration
│
├── .gitignore                  # Monorepo gitignore
├── package.json                # Root workspace configuration & scripts
└── README.md                   # Project documentation
```

---

## ⚙️ Environment Variables

### 1. Server Environment (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port the backend server listens on | `5000` |
| `NODE_ENV` | Application runtime environment | `development` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/framelog?schema=public` |
| `JWT_ACCESS_SECRET` | Secret key for signing access JWTs | `your_access_secret_key` |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh JWTs | `your_refresh_secret_key` |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifespan | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan | `7d` |

### 2. Client Environment (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```bash
cp client/.env.example client/.env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for backend API requests | `http://localhost:5000/api` |

---

## 🛠️ Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v24 LTS recommended)
- **npm**: v9.0.0 or later
- **PostgreSQL**: Running locally or on a cloud instance

### 2. Installation
Install all dependencies for root, client, and server in one command:
```bash
npm install
```

### 3. Generate Prisma Client
Generate the TypeScript Prisma client based on `server/prisma/schema.prisma`:
```bash
npm run prisma:generate
```

> **Note on Database Migration:** Once your local PostgreSQL instance is running with the credentials specified in `server/.env`, apply migrations using:
> ```bash
> npm run prisma:migrate
> ```

### 4. Running the Development Servers

#### Option A: Run Both Client & Server Concurrently (Recommended)
From the project root:
```bash
npm run dev
```
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

#### Option B: Run Standalone Services
To run the backend only:
```bash
npm run dev:server
```

To run the frontend only:
```bash
npm run dev:client
```

---

## 📜 Available NPM Scripts

Run these from the repository root:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs both backend and frontend concurrently with colored prefixes |
| `npm run dev:server` | Starts the Express server with `tsx watch` hot reloading |
| `npm run dev:client` | Starts the Vite React development server |
| `npm run build` | Compiles both backend (`tsc`) and frontend (`vite build`) |
| `npm run build:server` | Compiles the backend TypeScript into `server/dist` |
| `npm run build:client` | Bundles the frontend production assets into `client/dist` |
| `npm run prisma:generate` | Generates the `@prisma/client` library from schema |
| `npm run prisma:migrate` | Runs Prisma database migrations in development |
| `npm run prisma:studio` | Opens Prisma Studio GUI in the browser |

---

## 🔍 API Endpoints (Current Base)

### Health Check
- **`GET /api/health`**
  - **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "FrameLog API is healthy and operational",
      "data": {
        "status": "ok",
        "timestamp": "2026-09-29T07:53:41.260Z",
        "uptime": 12.4,
        "environment": "development",
        "version": "1.0.0"
      }
    }
    ```

---

## 🛣️ Upcoming Milestones
1. **User Authentication:** Registration, login, password hashing (`bcryptjs`), and JWT rotation.
2. **Movie Data Pipeline:** Integration with TMDb (The Movie Database) for film metadata, posters, cast & crew.
3. **Film Logging & Diary:** Personal logbook entries, star ratings, review drafts, and rewatch indicators.
4. **Custom Lists & Watchlists:** User-curated film collections and ranking systems.
5. **Real-time Social:** Comment threads and Socket.IO real-time direct messaging.
