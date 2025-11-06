# 🌟 MicroSpark - Immersive 3D Donation Platform

An immersive 3D web application for micro-donations featuring real-time ripple effects, 3D visualizations, and gamified giving experiences.

![MicroSpark](https://img.shields.io/badge/MicroSpark-3D%20Donation%20Platform-purple)
![React](https://img.shields.io/badge/React-19.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)

---

## ✨ Features

- 🌐 **3D Registration Space** — Floating animated sphere with emotion detection  
- 💧 **Donation Pool** — Real-time ripple effects on 3D water surface  
- 📦 **Payment Cube** — 3D rotating QR cube for UPI payments (PhonePe / Google Pay)  
- 🎨 **Impact Visualization** — Growing trees, butterflies, and floating books based on donation type  
- 🎤 **Audio Messages** — Record voice messages for donations  
- ⭐ **Hope Points** — Gamified rewards system  
- 🌳 **Timeline Garden** — 3D visualization of donation history  

---

## 🛠️ Tech Stack

### 🧩 Backend
- FastAPI  
- MongoDB (Motor async driver)  
- Python 3.8+  

### 🎨 Frontend
- React 19  
- Three.js / React-Three-Fiber  
- Tailwind CSS  
- Framer Motion  
- Face-api.js  
- Sonner (Toast notifications)  

---

## 🚀 Installation

### ⚙️ Prerequisites
- Node.js 18+  
- Python 3.8+  
- MongoDB  

---

### 🧠 Project Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB connection string

# Run platform server
uvicorn server:app --reload --host 0.0.0.0 --port 8000

# In another terminal, run the bank server
node server.js

#In another terminal, run the below commands
cd frontend

# Install dependencies
npm install
# or
yarn install

# Create .env file
cp .env.example .env
# Edit .env with your backend URL

# Run development server
npm start
# or
yarn start
