import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
const uri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("nova_bank");
    console.log("✅ Connected to MongoDB (nova_bank)");

    await initializeDemoAccounts();

    // ✅ Start server only after DB is ready
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Bank server running on port ${PORT}`);
      console.log(`📍 API endpoint: http://localhost:${PORT}\n`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

connectDB();

// ✅ Initialize the 4 specific UPI accounts
async function initializeDemoAccounts() {
  const accounts = db.collection("accounts");
  
  // Check if merchant account exists
  const merchantExists = await accounts.findOne({ upiId: "merchant@bank" });
  if (!merchantExists) {
    await accounts.insertOne({
      id: 0,
      name: "MicroSpark Merchant",
      bankName: "nexon",
      accountNumber: "0000000000000000",
      upiId: "merchant@bank",
      pin: 0,
      balance: 0,
      createdAt: new Date()
    });
    console.log("✅ Merchant account created");
  }

  // The 4 user accounts
  const demoAccounts = [
    {
      id: 1,
      name: "Mrunal Manjunath Kudtarkar",
      bankName: "nexon",
      accountNumber: "5291648233449087",
      upiId: "mrunal@upi",
      pin: 1111,
      balance: 1000.00
    },
    {
      id: 2,
      name: "N. Rakshitha",
      bankName: "nexon",
      accountNumber: "3745920113466782",
      upiId: "rakshitha@upi",
      pin: 2222,
      balance: 1000.00
    },
    {
      id: 3,
      name: "Meghana Saisri Bisa",
      bankName: "nexon",
      accountNumber: "6011442288993310",
      upiId: "meghana@upi",
      pin: 3333,
      balance: 1000.00
    },
    {
      id: 4,
      name: "Mitha M K",
      bankName: "nexon",
      accountNumber: "4532781011234456",
      upiId: "mitha@upi",
      pin: 4444,
      balance: 1000.00
    }
  ];

  for (const account of demoAccounts) {
    const exists = await accounts.findOne({ upiId: account.upiId });
    if (!exists) {
      await accounts.insertOne({
        ...account,
        createdAt: new Date()
      });
      console.log(`✅ Created account: ${account.name} (${account.upiId})`);
    }
  }
  /*
  console.log("\n💳 Available Test Accounts:");
  console.log("┌─────────────────────────┬───────────────┬──────┬──────────┐");
  console.log("│ Name                    │ UPI ID        │ PIN  │ Balance  │");
  console.log("├─────────────────────────┼───────────────┼──────┼──────────┤");
  demoAccounts.forEach(acc => {
    console.log(`│ ${acc.name.padEnd(23)} │ ${acc.upiId.padEnd(13)} │ ${acc.pin} │ ₹${acc.balance.toFixed(2).padStart(7)} │`);
  });
  console.log("└─────────────────────────┴───────────────┴──────┴──────────┘\n");
  */
}

//connectDB();

// ✅ Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Bank server is running" });
});

// ✅ Get all available UPI accounts (for dropdown)
app.get("/api/accounts", async (req, res) => {
  try {
    const accounts = db.collection("accounts");
    const allAccounts = await accounts
      .find({ upiId: { $ne: "merchant@bank" } })
      .project({ _id: 0, name: 1, upiId: 1, balance: 1, bankName: 1 })
      .toArray();

    return res.json({
      status: "SUCCESS",
      accounts: allAccounts
    });
  } catch (err) {
    console.error("❌ Error fetching accounts:", err);
    return res.status(500).json({ status: "FAILURE", error: "Server error" });
  }
});

// ✅ Check UPI ID exists
app.post("/api/verify-upi", async (req, res) => {
  const { upiId } = req.body;

  try {
    const accounts = db.collection("accounts");
    const user = await accounts.findOne({ upiId });

    if (user) {
      return res.json({
        status: "SUCCESS",
        name: user.name,
        upiId: user.upiId,
        balance: user.balance
      });
    } else {
      return res.status(404).json({
        status: "FAILURE",
        error: "UPI ID not found"
      });
    }
  } catch (err) {
    console.error("❌ UPI verification error:", err);
    return res.status(500).json({ status: "FAILURE", error: "Server error" });
  }
});

app.post("/api/demo/complete-payment", async (req, res) => {
  const { upiId, pin, amount, orderId, donationId } = req.body;

  console.log("💳 Incoming Payment Request →", { upiId, pin, amount, orderId, donationId });

  if (!upiId || !pin || !amount) {
    return res.status(400).json({
      status: "FAILURE",
      error: "Missing required fields",
    });
  }

  try {
    const accounts = db.collection("accounts");

    // ✅ Normalize input (avoid case/whitespace mismatch)
    const cleanUpi = upiId.trim().toLowerCase();
    const merchantUpi = "merchant@bank";

    // 🔍 Lookup user
    const user = await accounts.findOne({ upiId: cleanUpi });
    if (!user) {
      console.log("❌ No account found for", cleanUpi);
      return res.status(404).json({ status: "FAILURE", error: "UPI ID not found" });
    }

    // 🔐 Validate PIN
    if (user.pin !== parseInt(pin)) {
      console.log("❌ Invalid PIN for", cleanUpi);
      return res.status(401).json({ status: "FAILURE", error: "Invalid UPI PIN" });
    }

    // 💰 Check funds
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ status: "FAILURE", error: "Invalid amount" });
    }
    if (user.balance < amt) {
      console.log("❌ Insufficient balance:", user.balance, "<", amt);
      return res.status(400).json({
        status: "FAILURE",
        error: "Insufficient balance",
        currentBalance: user.balance,
      });
    }

    // ✅ Deduct amount
    const newBalance = user.balance - amt;
    const txnId = "TXN" + Date.now();

    const deductResult = await accounts.updateOne(
      { upiId: cleanUpi },
      { $set: { balance: newBalance } }
    );

    console.log(
      `💾 Deduct update → Matched: ${deductResult.matchedCount}, Modified: ${deductResult.modifiedCount}`
    );

    if (deductResult.modifiedCount === 0) {
      console.error("❌ Deduction failed — no document modified for", cleanUpi);
      return res.status(500).json({
        status: "FAILURE",
        error: "Balance update failed",
      });
    }

    // ✅ Credit merchant
    const creditResult = await accounts.updateOne(
      { upiId: merchantUpi },
      { $inc: { balance: amt } }
    );

    console.log(
      `💾 Merchant credit → Matched: ${creditResult.matchedCount}, Modified: ${creditResult.modifiedCount}`
    );

    if (creditResult.modifiedCount === 0) {
      console.error("❌ Merchant credit failed, rolling back...");
      // Rollback user balance if merchant credit failed
      await accounts.updateOne({ upiId: cleanUpi }, { $set: { balance: user.balance } });
      return res.status(500).json({
        status: "FAILURE",
        error: "Merchant credit failed — transaction rolled back",
      });
    }

    // 🧾 Record transaction
    const transactions = db.collection("transactions");
    await transactions.insertOne({
      txnId,
      fromUpi: cleanUpi,
      fromName: user.name,
      toUpi: merchantUpi,
      amount: amt,
      orderId: orderId || null,
      donationId: donationId || null,
      status: "SUCCESS",
      timestamp: new Date(),
    });

    console.log(`✅ Transaction complete: ₹${amt} from ${cleanUpi} → ${merchantUpi}`);

    return res.json({
      status: "SUCCESS",
      txnId,
      senderBalance: newBalance,
      amount: amt,
      senderName: user.name,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Payment processing error:", err);
    return res.status(500).json({
      status: "FAILURE",
      error: "Server error while processing payment",
    });
  }
});

// ✅ Get user balance
app.post("/api/get-balance", async (req, res) => {
  const { upiId } = req.body;

  try {
    const accounts = db.collection("accounts");
    const user = await accounts.findOne({ upiId });

    if (!user) {
      return res.status(404).json({ status: "FAILURE", error: "UPI ID not found" });
    }

    return res.json({
      status: "SUCCESS",
      balance: user.balance,
      upiId: user.upiId,
      name: user.name
    });
  } catch (err) {
    console.error("❌ Balance check error:", err);
    return res.status(500).json({ status: "FAILURE", error: "Server error" });
  }
});

// ✅ Get transaction history
app.get("/api/transactions/:upiId", async (req, res) => {
  const { upiId } = req.params;

  try {
    const transactions = db.collection("transactions");
    const txnHistory = await transactions
      .find({ $or: [{ fromUpi: upiId }, { toUpi: upiId }] })
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();

    return res.json({
      status: "SUCCESS",
      transactions: txnHistory
    });
  } catch (err) {
    console.error("❌ Transaction history error:", err);
    return res.status(500).json({ status: "FAILURE", error: "Server error" });
  }
});