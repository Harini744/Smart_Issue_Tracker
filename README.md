# Smart Issue Tracker

<p align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb)
![FastAPI](https://img.shields.io/badge/FastAPI-AI-009688?logo=fastapi)
![PyTorch](https://img.shields.io/badge/PyTorch-CNN-EE4C2C?logo=pytorch)
![License](https://img.shields.io/badge/License-MIT-green)

</p>

A modern **AI-powered MERN Stack** grievance management platform designed for colleges. The system enables students to submit complaints, while administrators efficiently manage issues using **JWT Authentication**, **Rule-Based NLP**, and **CNN-based Image Classification**.

---

## 📖 Overview

Smart Issue Tracker streamlines the complaint management process by combining traditional web technologies with Artificial Intelligence.

Students can submit grievances along with images, while the system automatically predicts the complaint category and priority. Administrators receive a centralized dashboard with analytics, complaint management, and notification features.

---

#  Features

### 👨‍🎓 Student Portal

- Secure JWT Authentication
- Register & Login
- Submit complaints
- Upload issue images
- Track complaint status
- Receive notifications

---

### 👨‍💼 Admin Dashboard

- Manage all complaints
- Update complaint status
- View analytics dashboard
- Export complaint reports
- User management

---

### 🤖 AI Features

- Rule-Based NLP Engine
  - Detects complaint category
  - Predicts complaint priority

- CNN Image Classification
  - Classifies uploaded complaint images
  - FastAPI + PyTorch microservice

---

## 🏗️ System Architecture

```
                 +------------------+
                 |     React App    |
                 +--------+---------+
                          |
                    REST API
                          |
                 +--------v---------+
                 |   Express API    |
                 | JWT Authentication|
                 +--------+---------+
                          |
        +-----------------+------------------+
        |                                    |
+-------v-------+                    +-------v-------+
|   MongoDB     |                    | AI Service    |
| Complaint DB  |                    | FastAPI       |
+---------------+                    | PyTorch CNN   |
                                     +---------------+
```

---

# 🛠 Tech Stack

| Category | Technology |
|-----------|------------|
| Frontend | React.js, Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JWT, bcryptjs |
| AI (NLP) | Rule-Based NLP Engine |
| AI (Vision) | FastAPI, PyTorch CNN |
| Charts | Chart.js |
| File Upload | Multer |
| Email | Nodemailer |
| Deployment | Vercel, Render, MongoDB Atlas |

---

# 📂 Project Structure

```
Smart_Issue_Tracker
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── models
│   ├── services
│   └── server.js
│
├── ai-service
│   ├── models
│   ├── app.py
│   ├── predict.py
│   └── requirements.txt
│
├── docker-compose.yml
├── README.md
└── LICENSE
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Harini744/Smart_Issue_Tracker.git

cd Smart_Issue_Tracker
```

---

## Install Dependencies

```bash
npm run install:all
```

---

## Configure Environment

Navigate to backend.

```bash
cd backend
cp .env.example .env
```

Example:

```env
PORT=5000

MONGO_URI=mongodb://localhost:27017/smart-issue-tracker

JWT_SECRET=your_secret_key

JWT_EXPIRE=7d

CLIENT_URL=http://localhost:3000

AI_SERVICE_URL=http://localhost:8000
```

---

# ▶️ Running the Project

## Start MongoDB

Ensure MongoDB is running locally or use MongoDB Atlas.

---

## Start Backend

```bash
cd backend

npm run dev
```

Runs on

```
http://localhost:5000
```

---

## Start Frontend

```bash
cd frontend

npm start
```

Runs on

```
http://localhost:3000
```

---

## Start AI Service

```bash
cd ai-service

python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

uvicorn app:app --reload --port 8000
```

Runs on

```
http://localhost:8000
```

---

# 🔐 Authentication

- JWT Authentication
- Role-Based Authorization
- Password Hashing (bcrypt)

Roles:

- Student
- Admin

---

# 📡 REST API

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Register Student |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current User |
| POST | `/api/complaints` | Create Complaint |
| GET | `/api/complaints` | Get Complaints |
| POST | `/api/complaints/analyze` | NLP Prediction |
| GET | `/api/admin/dashboard` | Dashboard Analytics |
| GET | `/api/admin/complaints` | All Complaints |
| PUT | `/api/admin/complaints/:id/status` | Update Status |
| GET | `/api/admin/export` | Export Reports |

---

# 🧠 AI Workflow

```
Complaint Submitted
          │
          ▼
 Rule-Based NLP
(Category + Priority)
          │
          ▼
 Image Uploaded
          │
          ▼
 PyTorch CNN
(Image Classification)
          │
          ▼
Stored in MongoDB
          │
          ▼
Admin Dashboard
```

---

# 🚀 Deployment

Frontend

- Vercel
- Netlify

Backend

- Render
- Railway

Database

- MongoDB Atlas

AI Service

- Render
- Railway

---

# 📸 Screenshots

### 🏠 Home Page

_Add Screenshot_

---

### 👨‍🎓 Student Dashboard

_Add Screenshot_

---

### 👨‍💼 Admin Dashboard

_Add Screenshot_

---

### 🤖 AI Complaint Analysis

_Add Screenshot_

---

# 🌟 Future Improvements

- Email Verification
- Real-Time Notifications
- Chat Support
- OCR Integration
- Multilingual Complaint Analysis
- Deep Learning Priority Prediction
- Mobile Application

---

# 👩‍💻 Author

**Harini V**

AI & Data Science Student

GitHub: https://github.com/Harini744



# 📄 License

This project is licensed under the **MIT License**.

---

⭐ If you found this project useful, consider giving it a **Star** on GitHub!
