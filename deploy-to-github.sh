#!/bin/bash

# HopeOrb GitHub Deployment Script
# This script helps you deploy the HopeOrb project to GitHub

echo "🚀 HopeOrb GitHub Deployment"
echo "================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Ask for GitHub repository URL
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/hopeorb.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Repository URL cannot be empty"
    exit 1
fi

echo ""
echo "📦 Preparing files..."

# Navigate to app directory
cd /app

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Create .gitignore files
echo "Creating .gitignore files..."

# Root .gitignore
cat > .gitignore << 'EOF'
# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
test_reports/
EOF

# Backend .gitignore
cat > backend/.gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# Environment
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF

# Frontend .gitignore
cat > frontend/.gitignore << 'EOF'
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
EOF

# Create .env.example files
echo "Creating .env.example files..."

cat > backend/.env.example << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=hopeorb_db
CORS_ORIGINS=*
EOF

cat > frontend/.env.example << 'EOF'
REACT_APP_BACKEND_URL=http://localhost:8000
EOF

# Create README.md
echo "Creating README.md..."
cat > README.md << 'EOF'
# HopeOrb - Immersive 3D Donation Platform 🌟

An immersive 3D web application for micro-donations featuring real-time ripple effects, 3D visualizations, and gamified giving experiences.

![HopeOrb](https://img.shields.io/badge/HopeOrb-3D%20Donation%20Platform-purple)
![React](https://img.shields.io/badge/React-19.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)

## ✨ Features

- 🌐 **3D Registration Space** - Floating animated sphere with emotion detection
- 💧 **Donation Pool** - Real-time ripple effects on 3D water surface
- 📦 **Payment Cube** - 3D rotating QR cube for UPI payments (PhonePe/Google Pay)
- 🎨 **Impact Visualization** - Growing trees, butterflies, and floating books based on donation type
- 🎤 **Audio Messages** - Record voice messages for donations
- ⭐ **Hope Points** - Gamified rewards system
- 🌳 **Timeline Garden** - 3D visualization of donation history

## 🛠️ Tech Stack

### Backend
- FastAPI
- MongoDB (Motor async driver)
- Python 3.8+

### Frontend
- React 19
- Three.js / React-Three-Fiber
- Tailwind CSS
- Framer Motion
- Face-api.js
- Sonner (Toast notifications)

## 🚀 Installation

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB

### Backend Setup

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

# Run server
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
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
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
hopeorb/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env.example      # Environment variables template
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.js        # Main app component
│   │   └── index.js      # Entry point
│   ├── package.json
│   └── .env.example     # Environment variables template
└── README.md
```

## 🎮 Usage

1. **Register**: Enter your name and email on the landing page
2. **Donate**: Select a charity and donation amount
3. **Pay**: Scan the QR code or use UPI payment (demo mode)
4. **Impact**: Watch your donation come to life in 3D
5. **Timeline**: View your donation history in the garden

## 🎯 API Endpoints

- `POST /api/register` - Register new user
- `GET /api/user/{user_id}` - Get user details
- `POST /api/donate` - Create donation
- `GET /api/donations` - Get donations (for ripples)
- `POST /api/payment/generate-upi` - Generate UPI payment
- `POST /api/payment/verify` - Verify payment (mocked)
- `POST /api/audio-message` - Save audio message
- `GET /api/charities` - Get all charities
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/user/{user_id}/timeline` - Get user timeline

## ⚠️ Note

- Payment verification is **mocked** for demo purposes
- Face emotion detection requires face-api.js models (optional)
- For production, integrate with real payment gateway (Razorpay/Stripe)

## 🔒 Security

- Never commit `.env` files
- Use environment variables for sensitive data
- Implement proper authentication for production
- Enable CORS only for trusted origins in production

## 📝 License

MIT License - Feel free to use for personal or commercial projects

## 👨‍💻 Author

Created with ❤️ using Emergent AI

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 🐛 Known Issues

- Face-api.js models need to be manually downloaded for emotion detection
- Payment is mocked - needs real gateway integration for production

## 🔮 Future Enhancements

- Real payment gateway integration
- Social sharing features
- Mobile app version
- Advanced analytics dashboard
- Multi-language support

## 📧 Contact

For questions or support, please open an issue on GitHub.
EOF

# Create LICENSE file
echo "Creating LICENSE file..."
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2025 HopeOrb

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

echo ""
echo "📝 Adding files to git..."
git add .

echo ""
echo "💾 Committing changes..."
git commit -m "Initial commit: HopeOrb 3D donation platform

- Immersive 3D donation experience with Three.js
- FastAPI backend with MongoDB
- Real-time ripple effects
- 3D payment cube with QR codes
- Impact visualization (trees, butterflies, books)
- Hope Points gamification system
- Timeline garden for donation history
- Audio message recording feature"

echo ""
echo "🔗 Adding remote repository..."
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"

echo ""
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main --force

echo ""
echo "✅ Successfully deployed to GitHub!"
echo ""
echo "🎉 Your repository is now available at:"
echo "$REPO_URL"
echo ""
echo "📋 Next steps:"
echo "1. Visit your GitHub repository"
echo "2. Add a description and topics"
echo "3. Enable GitHub Pages if you want to deploy the frontend"
echo "4. Star your own repo! ⭐"
echo ""
