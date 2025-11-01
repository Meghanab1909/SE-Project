import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "412356", // your MySQL password
  database: "nova_bank",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL (nova_bank)");
  }
});

// ✅ Payment route
app.post("/api/demo/complete-payment", (req, res) => {
  const { upiId, pin, amount, orderId } = req.body;

  if (!upiId || !pin || !amount) {
    return res
      .status(400)
      .json({ status: "FAILURE", error: "Missing required fields" });
  }

  const findUser = "SELECT * FROM accounts WHERE upiId = ?";
  db.query(findUser, [upiId], (err, results) => {
    if (err) return res.status(500).json({ status: "FAILURE", error: "DB error" });
    if (results.length === 0)
      return res.status(404).json({ status: "FAILURE", error: "UPI ID not found" });

    const user = results[0];

    // 🔐 Check PIN
    if (user.pin !== pin) {
      return res
        .status(401)
        .json({ status: "FAILURE", error: "Invalid UPI PIN" });
    }

    // 💰 Check balance
    if (parseFloat(user.balance) < parseFloat(amount)) {
      return res
        .status(400)
        .json({ status: "FAILURE", error: "Insufficient balance" });
    }

    // ✅ Deduct amount
    const newBalance = parseFloat(user.balance) - parseFloat(amount);
    const txnId = "TXN" + Date.now();

    const updateBalance = "UPDATE accounts SET balance = ? WHERE upiId = ?";
    db.query(updateBalance, [newBalance, upiId], (updateErr) => {
      if (updateErr)
        return res.status(500).json({ status: "FAILURE", error: "Failed to update balance" });

      // Optional: credit merchant
      const merchantUpi = "merchant@bank";
      db.query(
        "UPDATE accounts SET balance = balance + ? WHERE upiId = ?",
        [amount, merchantUpi],
        (merchantErr) => {
          if (merchantErr) console.warn("⚠️ Merchant update failed:", merchantErr);
        }
      );

      // 🟢 Send success response
      return res.json({
        status: "SUCCESS",
        txnId,
        senderBalance: newBalance,
      });
    });
  });
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
