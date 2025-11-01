import React, { useState } from "react";
import "./Home.css";

function Home() {
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handlePay = () => {
    if (!upiId || !amount) {
      setMessage("Please enter UPI ID and amount");
      return;
    }

    const orderId = "ORD" + Date.now();
    const url = `/payment?upi=${encodeURIComponent(upiId)}&amount=${amount}&orderId=${orderId}`;
    window.location.href = url;
  };

  return (
    <div className="home-body">
      <div className="background-blur"></div>

      <div className="home-container">
        <div className="header">
          <h2>✨ NOVA</h2>
          <p>Smart • Secure • Simple UPI</p>
        </div>

        <input
          type="text"
          placeholder="Enter UPI ID"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button onClick={handlePay}>Pay Now →</button>

        {message && (
          <div
            className={`message ${
              message.includes("enter") ? "error" : "success"
            }`}
          >
            {message}
          </div>
        )}

        <div className="footer">🔒 Secure UPI Payment Gateway</div>
      </div>
    </div>
  );
}

export default Home;
