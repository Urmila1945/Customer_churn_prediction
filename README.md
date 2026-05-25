# NeoPulse AI

Premium futuristic SaaS dashboard for Customer Churn Prediction.

## Overview

NeoPulse AI is a startup-grade full-stack prototype built with:

- React.js + Tailwind CSS + Framer Motion
- Recharts for animated analytics
- Python FastAPI backend
- MongoDB-ready data layer
- AI prediction and retention recommendation workflow

## Project structure

- `frontend/` - React dashboard UI
- `backend/` - FastAPI prediction API

## Run

### Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev`

### Backend

1. `cd backend`
2. `python -m pip install -r requirements.txt`
3. `uvicorn main:app --reload --port 8000`

### Auth

- Demo login: `neo_admin` / `NeoPulse@2026`
- The React frontend now authenticates with JWT and protects API calls.

## Features

- Glassmorphism UI with neon blue and purple gradients
- Animated KPI cards, heatmaps, risk dashboards, and prediction center
- AI assistant panel, explainable model insights, retention recommendations
- Responsive layout for desktop and mobile
