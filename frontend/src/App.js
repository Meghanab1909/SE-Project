import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import "@/App.css";
import RegistrationSpace from "@/components/RegistrationSpace";
import DonationHub from "@/components/DonationHub";
import TimelineGarden from "@/components/TimelineGarden";
import { Toaster } from "@/components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize charities on first load
    const initCharities = async () => {
      try {
        await axios.post(`${API}/init-charities`);
      } catch (e) {
        console.log("Charities init:", e.message);
      }
    };

    // Check for existing user in localStorage
    const storedUser = localStorage.getItem("hopeorb_user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    initCharities();
    setLoading(false);
  }, []);

  const handleUserRegistered = (user) => {
    setCurrentUser(user);
    localStorage.setItem("hopeorb_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("hopeorb_user");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              !currentUser ? (
                <RegistrationSpace onUserRegistered={handleUserRegistered} />
              ) : (
                <Navigate to="/hub" replace />
              )
            }
          />
          <Route
            path="/hub"
            element={
              currentUser ? (
                <DonationHub user={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/timeline"
            element={
              currentUser ? (
                <TimelineGarden user={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;