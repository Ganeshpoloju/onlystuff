# onlyStuff

Hyperlocal community commerce platform for Hyderabad apartment communities.

## Repos

| Directory | Stack | Purpose |
|-----------|-------|---------|
| [`frontend/`](./frontend) | React + Vite + Tailwind CSS | Main web app (Buy, Sell, Admin tabs) |
| [`backend/`](./backend) | Node.js + Express + Prisma | REST API + Socket.io |
| [`landing/`](./landing) | Static HTML/CSS | Marketing & landing pages |

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env .env.local   # fill in your values
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Landing
```bash
cd landing
# open index.html in browser, or serve with any static server
npx serve .
```

## Docs
- [PRD](./PRD.md) — Product Requirements Document
- [TRD](./TRD.md) — Technical Requirements Document
