import request from "supertest";
import { expect } from "chai";
import app, { connectDB, client } from "../server.js";

before(async () => {
  await connectDB(); 
});

after(async () => {
  await client.close(); 
});

describe("🌟 Micro Donation Bank API", function () {
  this.timeout(10000);

  // Health check
  it("GET /api/health → should return OK", async function () {
    const res = await request(app).get("/api/health");
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal("OK");
  });

  // Get all accounts
  it("GET /api/accounts → should return accounts list", async function () {
    const res = await request(app).get("/api/accounts");
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal("SUCCESS");
    expect(res.body.accounts).to.be.an("array");
    expect(res.body.accounts.length).to.be.greaterThan(0);
  });

  // Verify UPI (existing)
  it("POST /api/verify-upi → should verify a valid UPI ID", async function () {
    const res = await request(app)
      .post("/api/verify-upi")
      .send({ upiId: "mrunal@upi" });
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal("SUCCESS");
    expect(res.body.upiId).to.equal("mrunal@upi");
  });

  // Verify UPI (non-existent)
  it("POST /api/verify-upi → should fail for invalid UPI ID", async function () {
    const res = await request(app)
      .post("/api/verify-upi")
      .send({ upiId: "ghost@upi" });
    expect(res.status).to.equal(404);
    expect(res.body.status).to.equal("FAILURE");
  });

  // Get balance (valid)
  it("POST /api/get-balance → should return balance for valid user", async function () {
    const res = await request(app)
      .post("/api/get-balance")
      .send({ upiId: "mrunal@upi" });
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal("SUCCESS");
    expect(res.body.balance).to.be.a("number");
  });

  // Get balance (invalid)
  it("POST /api/get-balance → should return 404 for invalid user", async function () {
    const res = await request(app)
      .post("/api/get-balance")
      .send({ upiId: "invalid@upi" });
    expect(res.status).to.equal(404);
    expect(res.body.status).to.equal("FAILURE");
  });

  // Payment verify (valid)
  it("POST /api/payment/verify → should process a valid payment", async function () {
    const res = await request(app)
      .post("/api/payment/verify")
      .send({
        donation_id: "test_donation",
        payment_id: "test_payment",
        upi_id: "mrunal@upi",
        pin: "1111",
        amount: 10
      });
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.txnId).to.match(/^TXN/);
  });

  // Payment verify (invalid PIN)
  it("POST /api/payment/verify → should fail for wrong PIN", async function () {
    const res = await request(app)
      .post("/api/payment/verify")
      .send({
        upi_id: "mrunal@upi",
        pin: "9999",
        amount: 10
      });
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.false;
    expect(res.body.message).to.match(/Invalid UPI PIN/);
  });

  // Payment verify (insufficient balance)
  it("POST /api/payment/verify → should fail for insufficient balance", async function () {
    const res = await request(app)
      .post("/api/payment/verify")
      .send({
        upi_id: "mrunal@upi",
        pin: "1111",
        amount: 999999
      });
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.false;
    expect(res.body.message).to.match(/Insufficient balance/);
  });

  
  it("GET /api/transactions/user/:userId → should return recent transactions", async function () {
    const res = await request(app).get("/api/transactions/user/c3576984-978c-40b8-a5e2-0193feb852c5");
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal("SUCCESS");
    expect(res.body.transactions).to.be.an("array");
  });
});
