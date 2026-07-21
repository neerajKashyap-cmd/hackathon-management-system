# Hackathon Management System

A full-stack MERN application for managing hackathon team registration, project submissions, and judging/scoring.

## Tech Stack
- **Frontend:** React
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT

## Project Structure

hackathon-management-system/
├── backend/
│ ├── config/ # DB connection
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API routes
│ ├── controllers/ # Route logic
│ ├── middleware/ # Auth middleware, etc.
│ └── server.js
└── frontend/ # React app


## Features
- **Auth:** Register/login with role-based access (participant, judge, admin)
- **Teams:** Create teams, join via invite code, manage members
- **Admin:** Create hackathon events, assign judges, manage submissions, view dashboard stats
- **Submissions:** Submit projects with repo link, description, tech stack
- **Judging:** Score submissions against criteria, leave feedback
- **Leaderboard:** Live rankings based on judge scores
- **Announcements:** Admin can post updates visible to all participants

## Development Roadmap
- [x] Day 1: Project setup, Express server, MongoDB connection
- [ ] Day 2: User & Team models, JWT authentication (role-based)
- [ ] Day 3: Team registration API/frontend + Admin event creation
- [ ] Day 4: Project submission API + frontend form
- [ ] Day 5: Judging & scoring system + Admin judge assignment
- [ ] Day 6: Leaderboard, announcements, admin dashboard, final polish & documentation
