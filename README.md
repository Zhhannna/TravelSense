# 🌍 TravelSense+

AI-powered travel recommendation platform that helps users discover the best destinations based on weather, air quality, budget, travel preferences, and real-time external data.

Built with FastAPI, React, PostgreSQL, Redis, and Docker.

---

## ✨ Features

- Personalized destination recommendations
- TravelScore recommendation engine
- JWT Authentication & Authorization
- User preferences management
- Favorites system
- Advanced filtering & pagination
- Real-time weather integration
- Air Quality Index (AQI) integration
- Responsive React frontend
- Dockerized deployment
- CI/CD with GitHub Actions

---

## 🏗 Architecture

Frontend (React + Vite)
        ↓
Backend API (FastAPI)
        ↓
 PostgreSQL
        ↓
Redis Cache
        ↓
External APIs
(OpenWeatherMap, AQI)

---

## 🧠 TravelScore Algorithm

TravelSense+ evaluates destinations using a custom scoring system:

TravelScore =
Weather × 30%
AQI × 20%
Price × 25%
Travel Type × 15%
Continent Match × 10%

The system ranks destinations and returns personalized recommendations.

---

## 🚀 Tech Stack

### Backend

- FastAPI
- SQLAlchemy
- Alembic
- JWT Authentication
- Argon2 Password Hashing
- Redis
- PostgreSQL
- Pytest

### Frontend

- React
- Vite
- Axios
- React Router
- Zustand

### DevOps

- Docker
- Docker Compose
- GitHub Actions
- Railway

---

## 📡 API Overview

Authentication:
- POST /auth/register
- POST /auth/login
- GET /auth/me

Destinations:
- GET /destinations
- GET /destinations/{id}
- POST /destinations
- PUT /destinations/{id}
- DELETE /destinations/{id}

Users:
- Favorites management
- Preferences management

Recommendations:
- GET /recommendations

---

## 📊 Project Highlights

- 28 automated tests
- 88% test coverage
- Role-based authorization
- Asynchronous external API integration
- Redis caching layer
- Dockerized microservice-ready architecture

---

## 🐳 Running 

# Option 1
docker-compose up --build

# Option 2

## Terminal 1
cd travelsense/backend
venv\Scripts\activate
uvicorn app.main:app --reload

## Terminal 2  
cd travelsense/frontend
npm install
npm run dev
---

## 🔮 Future Improvements

- Machine Learning recommendation model
- Flight API integration
- Hotel recommendations
- Interactive destination maps
- Mobile application
