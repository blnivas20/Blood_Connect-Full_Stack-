# 🩸 BloodConnect

**Live Application:**  
https://blood-connect-frontend.vercel.app/

BloodConnect is a real-time blood donor–requester connection platform built using **Django REST Framework, React, WebSockets, and Redis**.

It solves one problem clearly:

> Connect people who urgently need blood with compatible donors in real time.

No blood stock tracking.  
No unnecessary complexity.  
Just direct human connection.

---

# 🚀 Features

## 🔐 Authentication
- User Registration
- JWT Login
- Protected APIs

## 👤 Automatic Profile Creation
- Every user automatically gets a profile via Django signals
- Stores blood group, phone, location, last donated date

## 🩸 Blood Request System
Users can create blood requests with:
- Patient name
- Age (validated)
- Blood group
- Urgency level
- Location
- Reason

Rules:
- Age must be greater than 0
- Only authenticated users can create requests

## 🧬 Blood Compatibility Check
Donors:
- Cannot accept their own request
- Cannot accept completed requests
- Cannot accept incompatible blood groups

Compatibility validation is handled in backend logic.

## 🤝 Accept & Finalize Flow

1. Donor accepts a request
2. Requester sees accepted donors
3. Requester finalizes one donor
4. Others automatically get rejected
5. Request marked as `Success`

Only one donor can be finalized.

## 💬 Real-Time Chat
- Private WebSocket room created between requester and finalized donor
- Messages synced instantly
- Powered by Django Channels + Redis

---

# 🏗️ Tech Stack

## Backend
- Django
- Django REST Framework
- Django Signals
- Django Channels
- Redis (Channel Layer)
- SQLite (Development)

## Frontend
- React
- TailwindCSS
- Axios
- WebSocket client

## Deployment
- Frontend: Vercel
- Backend: Render
- Redis: Redis Cloud

---

# 📦 API Overview

## Authentication
```
POST /auth/register/
POST /auth/login/
```

## Profile
```
GET  /profile/
PUT  /profile/
```

## Requests
```
GET  /requests/
POST /requests/
GET  /requests/<short_id>/
```

## Donor Actions
```
POST /requests/<short_id>/accept/
GET  /requests/<short_id>/accepted/
POST /accepted/<unique_id>/finalize/
```

---

# 🔄 Request Lifecycle

```
Pending → Accepted → Finalized → Success
```

Only the requester can finalize.  
Only compatible donors can accept.

---

# 🛠️ Local Setup

## 1. Clone Repository
```
git clone <your-repo-url>
cd bloodconnect
```

## 2. Backend Setup
```
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## 3. Frontend Setup
```
npm install
npm run dev
```

---

# 🔐 Security & Validation

- JWT Authentication
- Role-based restrictions
- Duplicate accept prevention
- Blood compatibility enforcement
- Request ownership validation
- Proper serializer validation

---

# 📈 Future Improvements

- Location-based donor filtering
- Donor availability toggle
- SMS notifications
- Push notifications
- Admin dashboard analytics
- PostgreSQL production setup
- Rate limiting

---

# 🧠 Why This Project Matters

This is not a CRUD demo.

This project demonstrates:

- Real-world workflow modeling
- Business rule enforcement
- Serializer validation
- Django Signals
- Role-based access control
- Real-time WebSocket communication
- Clean REST API architecture

It reflects practical backend system design thinking.

---

# 👨‍💻 Author

Built to deeply understand:

- Django
- DRF
- Real-time systems
- Backend architecture
- Production deployment workflows

---

If you're reviewing this project, focus on:

- Business logic enforcement
- Request lifecycle modeling
- Blood compatibility validation
- WebSocket room architecture
- Clean API structure

This project is built with intention.