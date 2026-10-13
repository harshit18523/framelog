# 🎬 FrameLog

> **The Social Film Diary & Tracker for Cinephiles.** Track films you’ve watched, save those you want to see, craft curated lists, and share your cinematic journey with friends.

FrameLog is an open-source, full-stack web application inspired by Letterboxd — built from scratch without third-party BaaS platforms like Firebase, Supabase, or Auth0.

---

## 🚀 Tech Stack

### Frontend (`client/`)
- **Core:** [React 19](https://react.dev/) + [Vite](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v3](https://tailwindcss.com/) with cinematic dark palette & custom design tokens
- **Routing:** [React Router](https://reactrouter.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State & Animations:** Context API, [Framer Motion](https://www.framer.com/motion/), [Sonner](https://sonner.emilkowal.ski/)
- **HTTP Client:** [Axios](https://axios-http.com/) with centralized interceptors

### Backend (`server/`)
- **Runtime:** [Node.js](https://nodejs.org/) (v24 LTS)
- **Framework:** [Express](https://expressjs.com/) + [TypeScript](https://www.typescriptlang.org/)
- **Database:** [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- **Authentication:** Custom JWT (Access Token + Refresh Token in HTTP-only cookies)
- **Password Security:** [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Execution:** [tsx](https://github.com/privatenumber/tsx) for fast TypeScript watch mode

---

## 📁 Repository Structure

```text
framelog/
├── client/                     # Frontend React + Vite application
│   ├── public/                 # Static film poster artwork & assets
│   ├── src/
│   │   ├── components/         # UI & Feature components
│   │   │   ├── app/            # AppShell, TopBar, Sidebar, MobileTabBar
│   │   │   ├── auth/           # AuthLayout, SocialAuthButtons
│   │   │   ├── diary/          # DiaryTimeline, DiaryCalendar, LogFilmDialog
│   │   │   ├── discover/       # SpotlightCard
│   │   │   ├── feed/           # ActivityCard, HomeRail
│   │   │   ├── film/           # Poster, RatingHistogram, FilmCredits, FilmReviews
│   │   │   ├── marketing/      # HeroSection, FeatureShowcase, PosterWall
│   │   │   ├── profile/        # ProfileHeader, ProfileFilmsGrid, ProfileLists
│   │   │   └── ui/             # Button, TextField, Tabs, SegmentedControl, etc.
│   │   ├── contexts/           # LibraryContext (reactive film likes, logs, watchlists)
│   │   ├── data/               # Curated films, users, and activity data
│   │   ├── pages/              # Landing, Home, Discover, Diary, Profile, FilmDetail, Login, Register
│   │   ├── types/              # Frontend TypeScript definitions
│   │   ├── utils/              # Helper utilities
│   │   ├── App.tsx             # Application router
│   │   ├── index.css           # Global typography & Tailwind imports
│   │   └── main.tsx            # React DOM mounting
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/                     # Backend Express + MongoDB API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts           # Mongoose MongoDB connection & lifecycle
│   │   ├── models/
│   │   │   └── User.ts         # User schema & bcrypt methods
│   │   ├── controllers/
│   │   │   └── auth.controller.ts  # Register, Login, Logout, Me handlers
│   │   ├── routes/
│   │   │   ├── auth.routes.ts  # Auth endpoints
│   │   │   └── index.ts        # API router aggregation & health check
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts  # JWT Bearer / Cookie authentication
│   │   │   └── errorHandler.ts # Centralized error & 404 handlers
│   │   ├── utils/
│   │   │   ├── ApiError.ts     # Operational API error class
│   │   │   ├── ApiResponse.ts  # Standardized response wrapper
│   │   │   ├── asyncHandler.ts # Async route wrapper
│   │   │   └── jwt.ts          # Access & Refresh token generators
│   │   ├── app.ts              # Express configuration & CORS
│   │   └── server.ts           # HTTP server bootstrap & graceful shutdown
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── package.json                # Monorepo workspace scripts
└── README.md
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)
Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Connection String (Local or MongoDB Atlas)
MONGODB_URI=mongodb://localhost:27017/framelog

# JWT Authentication
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Client (`client/.env`)
Create `client/.env` based on `client/.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Servers
From the root directory:
```bash
# Run both Backend & Frontend concurrently
npm run dev

# Or run separately:
npm run dev:server    # Starts Express backend on http://localhost:5000
npm run dev:client    # Starts Vite frontend on http://localhost:5173
```

---

## 🔐 Authentication API Reference

### 1. Register User
- **Method:** `POST /api/auth/register`
- **Request Body:**
  ```json
  {
    "name": "Maya Lindqvist",
    "username": "maya",
    "email": "maya@example.com",
    "password": "password123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "_id": "670a...",
        "name": "Maya Lindqvist",
        "username": "maya",
        "email": "maya@example.com",
        "avatar": "",
        "bio": "",
        "location": "",
        "createdAt": "2026-10-13T...",
        "updatedAt": "2026-10-13T..."
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```
  *(Also sets HTTP-only `accessToken` and `refreshToken` cookies).*

### 2. Login
- **Method:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "maya@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User logged in successfully",
    "data": {
      "user": { ... },
      "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```

### 3. Get Current User (Protected)
- **Method:** `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <accessToken>` *(or via HTTP-only cookie)*
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Current user retrieved successfully",
    "data": {
      "user": { ... }
    }
  }
  ```

### 4. Logout
- **Method:** `POST /api/auth/logout`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User logged out successfully",
    "data": null
  }
  ```
