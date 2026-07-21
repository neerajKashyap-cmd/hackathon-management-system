# Hackathon Management System

A full-stack MERN application for managing hackathon team registration, project submissions, and judging/scoring.

## Tech Stack
- **Frontend:** React
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT

## Project Structure
```
hackathon-management-system/
├── backend/
│   ├── config/        # DB connection
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API routes
│   ├── controllers/   # Route logic
│   ├── middleware/     # Auth middleware, etc.
│   └── server.js
└── frontend/           # React app
```

## Development Roadmap
- [x] Day 1: Project setup, Express server, MongoDB connection
- [ ] Day 2: User & Team models, JWT authentication
- [ ] Day 3: Team registration API + frontend form
- [ ] Day 4: Project submission API + frontend form
- [ ] Day 5: Judging & scoring system
- [ ] Day 6: Leaderboard, polish, final documentation

## Setup
1. `cd backend && npm install`
2. Copy `.env.example` to `.env` and fill in values
3. `npm run dev`
