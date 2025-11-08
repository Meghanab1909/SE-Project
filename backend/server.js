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
    if (process.env.NODE_ENV !== "test") {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`🚀 Bank server running on port ${PORT}`);
        console.log(`📍 API endpoint: http://localhost:${PORT}\n`);
      });
  }
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

if (process.env.NODE_ENV !== "test") {
  connectDB();
}

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
app.get("/api/transactions/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const transactions = db.collection("transactions");
    const txnHistory = await transactions
      .find({ userId: userId })
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();

    return res.json({
      status: "SUCCESS",
      transactions: txnHistory
    });
  } catch (err) {
    console.error("❌ Transaction history (userId) error:", err);
    return res.status(500).json({ status: "FAILURE", error: "Server error" });
  }
});


app.post("/api/payment/verify", async (req, res) => {
  const { donation_id, payment_id, upi_id, pin, amount } = req.body;

  console.log("💳 Verifying payment via /payment/verify →", {
    upi_id,
    pin,
    amount,
    donation_id,
    payment_id,
  });

  try {
    const accounts = db.collection("accounts");
    const transactions = db.collection("transactions");

    const cleanUpi = upi_id.trim().toLowerCase();
    const merchantUpi = "merchant@bank";
    const amt = Number(amount) || 100; // fallback demo amount

    console.log("💰 Received amount:", amount, "→ parsed:", Number(amount));

    // 🔍 Find user
    const user = await accounts.findOne({ upiId: cleanUpi });
    if (!user) {
      return res.json({ success: false, message: "UPI ID not found" });
    }

    // 🔐 Verify PIN
    if (user.pin !== parseInt(pin)) {
      return res.json({ success: false, message: "Invalid UPI PIN" });
    }

    // 💰 Check balance
    if (user.balance < amt) {
      return res.json({
        success: false,
        message: "Insufficient balance",
        currentBalance: user.balance,
      });
    }

    // ✅ Deduct + credit
    const newBalance = user.balance - amt;
    const txnId = "TXN" + Date.now();

    await accounts.updateOne({ upiId: cleanUpi }, { $set: { balance: newBalance } });
    await accounts.updateOne({ upiId: merchantUpi }, { $inc: { balance: amt } });

    const userId = user?.userId || null

    // 🧾 Log transaction
    await transactions.insertOne({
      txnId,
      fromUpi: cleanUpi,
      toUpi: merchantUpi,
      amount: amt,
      orderId: payment_id || null,
      donationId: donation_id || null,
      userId,
      status: "SUCCESS",
      timestamp: new Date(),
    });

    let fundName = "fund@upi"

    if (donation_id) {
      try {
        const donationClient = new MongoClient(process.env.MONGO_URL || "mongodb://127.0.0.1:27017");
        await donationClient.connect();
        const hopeorbDB = donationClient.db("hopeorb_db");

        const donations = hopeorbDB.collection("donations");
        const charities = hopeorbDB.collection("charities");

        const donation = await donations.findOne({ id: donation_id });
        if (donation) {
          const charity = await charities.findOne({ id: donation.charity_id });
          if (charity) {
            fundName = charity.name; // ✅ use the fund’s name for logging

            await charities.updateOne(
              { id: donation.charity_id },
              { $inc: { current_amount: amt } }
            );
            await donations.updateOne(
              { id: donation_id },
              { $set: { status: "completed", txn_id: txnId, updated_at: new Date() } }
            );
            console.log(`💰 Updated charity: ${charity.name} (+₹${amt})`);
          } else {
            console.warn("⚠️ Charity not found for donation:", donation.charity_id);
          }
        } else {
          console.warn("⚠️ Donation not found in hopeorb_db:", donation_id);
        }

        await donationClient.close();
      } catch (updateErr) {
        console.error("❌ Error updating charity in hopeorb_db:", updateErr);
      }
    }

    // ✅ Use fundName in transaction log
    console.log(`✅ Transaction complete: ₹${amt} from ${cleanUpi} → ${fundName}`);

    console.log(`✅ Payment verified: ₹${amt} deducted from ${cleanUpi}`);

    return res.json({
      success: true,
      txnId,
      message: "Payment successful",
      senderBalance: newBalance,
    });
  } catch (err) {
    console.error("❌ Error in /payment/verify:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during payment verification",
    });
  }
});

export { connectDB, client };
export default app;