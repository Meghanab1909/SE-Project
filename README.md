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

\`\`\`bash
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
\`\`\`

### Frontend Setup

\`\`\`bash
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
\`\`\`

The app will open at \`http://localhost:3000\`

## 📁 Project Structure

\`\`\`
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
\`\`\`

## 🎮 Usage

1. **Register**: Enter your name and email on the landing page
2. **Donate**: Select a charity and donation amount
3. **Pay**: Scan the QR code or use UPI payment (demo mode)
4. **Impact**: Watch your donation come to life in 3D
5. **Timeline**: View your donation history in the garden

## 🎯 API Endpoints

- \`POST /api/register\` - Register new user
- \`GET /api/user/{user_id}\` - Get user details
- \`POST /api/donate\` - Create donation
- \`GET /api/donations\` - Get donations (for ripples)
- \`POST /api/payment/generate-upi\` - Generate UPI payment
- \`POST /api/payment/verify\` - Verify payment (mocked)
- \`POST /api/audio-message\` - Save audio message
- \`GET /api/charities\` - Get all charities
- \`GET /api/leaderboard\` - Get leaderboard
- \`GET /api/user/{user_id}/timeline\` - Get user timeline

## ⚠️ Note

- Payment verification is **mocked** for demo purposes
- Face emotion detection requires face-api.js models (optional)
- For production, integrate with real payment gateway (Razorpay/Stripe)

## 🔒 Security

- Never commit \`.env\` files
- Use environment variables for sensitive data
- Implement proper authentication for production
- Enable CORS only for trusted origins in production

## 📝 License

MIT License - Feel free to use for personal or commercial projects

## 👨‍💻 Author

Created by Rakshitha with ❤️

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

---

⭐ Star this repo if you find it helpful!
