# 🚀 InternHub — Virtual Internship & Job Matching Platform

A full-stack MERN application with real-time chat, job matching, task management, and more.

---

## 📁 Project Structure

```
vijmp/
├── server/          # Express + Node.js backend
│   ├── models/      # Mongoose models
│   ├── routes/      # API routes
│   ├── middleware/  # Auth, upload middleware
│   ├── utils/       # Socket.IO, notifications
│   ├── uploads/     # Uploaded files (auto-created)
│   └── index.js     # Entry point
├── client/          # React + Vite frontend
│   └── src/
│       ├── pages/       # All page components
│       ├── components/  # Shared components
│       ├── context/     # Auth + Socket contexts
│       └── api/         # Axios client
└── package.json     # Root with concurrently
```

---

## ⚙️ Prerequisites

- **Node.js** v18+ 
- **MongoDB** running locally (or MongoDB Atlas URI)
- **npm** v9+

---

## 🛠️ Setup & Installation

### 1. Clone / navigate to the project

```bash
cd vijmp
```

### 2. Install all dependencies

```bash
# Root (concurrently)
npm install

# Server dependencies
cd server && npm install && cd ..

# Client dependencies
cd client && npm install && cd ..
```

Or run all at once:
```bash
npm run install:all
```

### 3. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/vijmp
JWT_SECRET=your_super_secret_jwt_key_change_in_production
CLIENT_URL=http://localhost:5173
```

For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

### 4. Start the application

```bash
# Run both server + client simultaneously (from root)
npm run dev
```

Or individually:
```bash
# Terminal 1 — Backend (port 5000)
npm run dev:server

# Terminal 2 — Frontend (port 5173)
npm run dev:client
```

### 5. Open in browser

```
http://localhost:5173
```

---

## 🔑 Test Accounts (create via Register)

Register two accounts to test the full flow:

**Employer:**
- Role: employer
- Company: Acme Corp

**Candidate:**
- Role: candidate  
- Skills: React, Node.js (add in Profile)

---

## ✅ Feature Checklist

| Feature | Status |
|---------|--------|
| JWT Auth (register/login) | ✅ |
| Role-based access (candidate/employer) | ✅ |
| Job CRUD (employer) | ✅ |
| Job browsing + search/filter (candidate) | ✅ |
| Skill-based job recommendations | ✅ |
| Job applications with cover letter | ✅ |
| Application status management | ✅ |
| Real-time chat (Socket.IO) | ✅ |
| Message persistence (MongoDB) | ✅ |
| Task assignment (accepted interns only) | ✅ |
| File upload for task submissions (multer) | ✅ |
| Task review + grading | ✅ |
| Profile editing | ✅ |
| Real-time notifications | ✅ |
| Online user presence | ✅ |

---

## 🌐 API Reference

### Auth
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login

### Users
- `GET /api/users/me` — Get current user
- `PUT /api/users/me` — Update profile
- `GET /api/users/:id` — Get user by ID

### Jobs
- `GET /api/jobs` — List jobs (filtered by role)
- `GET /api/jobs/recommended` — Recommended jobs (candidate)
- `GET /api/jobs/:id` — Job details
- `POST /api/jobs` — Create job (employer)
- `PUT /api/jobs/:id` — Update job (employer)
- `DELETE /api/jobs/:id` — Delete job (employer)

### Applications
- `POST /api/applications/:jobId` — Apply to job
- `GET /api/applications` — List applications
- `GET /api/applications/:id` — Application details
- `PATCH /api/applications/:id/status` — Update status (employer)

### Chat
- `GET /api/chat/conversations` — List conversations
- `POST /api/chat/conversations/with/:userId` — Get/create conversation
- `GET /api/chat/conversations/:id/messages` — Get messages
- `POST /api/chat/conversations/:id/messages` — Send message

### Tasks
- `POST /api/tasks` — Create task (employer, accepted apps only)
- `GET /api/tasks` — List tasks
- `POST /api/tasks/:id/submit` — Submit task (candidate)
- `PATCH /api/tasks/:id/review` — Review submission (employer)

### Notifications
- `GET /api/notifications` — List notifications
- `PATCH /api/notifications/read-all` — Mark all read
- `PATCH /api/notifications/:id/read` — Mark one read

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken, bcryptjs) |
| Real-time | Socket.IO |
| File Upload | Multer |
| Fonts | Plus Jakarta Sans, Syne (Google Fonts) |

---

## 📝 Notes

- Files uploaded via task submissions are stored in `server/uploads/`
- The Vite dev server proxies `/api` and `/uploads` to `localhost:5000`
- Socket.IO uses JWT auth — the token is passed via `socket.handshake.auth.token`
- Chat is restricted to users connected via job applications
