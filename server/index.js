import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const billSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  room1: {
    previousReading: Number, currentReading: Number,
    unitsUsed: Number, shareOfMotor: Number, totalUnits: Number, amount: Number,
  },
  room2: {
    previousReading: Number, currentReading: Number,
    unitsUsed: Number, shareOfMotor: Number, totalUnits: Number, amount: Number,
  },
  motor: {
    previousReading: Number, currentReading: Number,
    unitsUsed: Number, ownerShare: Number, tenantsShare: Number, perRoomShare: Number,
  },
  ratePerUnit: Number,
});

const Bill = mongoose.model("Bill", billSchema);

// Latest readings for next bill
app.get("/api/latest", async (req, res) => {
  try {
    const latest = await Bill.findOne().sort({ date: -1 });
    if (!latest) return res.json({ exists: false });
    res.json({
      exists: true,
      room1Previous: latest.room1.currentReading,
      room2Previous: latest.room2.currentReading,
      motorPrevious: latest.motor.currentReading,
      date: latest.date,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Edit previous readings (inline edit feature)
app.patch("/api/latest", async (req, res) => {
  try {
    const latest = await Bill.findOne().sort({ date: -1 });
    if (!latest) return res.status(404).json({ error: "No bill found" });
    const { room1, room2, motor } = req.body;
    if (room1 !== undefined) latest.room1.currentReading = room1;
    if (room2 !== undefined) latest.room2.currentReading = room2;
    if (motor !== undefined) latest.motor.currentReading = motor;
    await latest.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Save new bill
app.post("/api/bills", async (req, res) => {
  try {
    const bill = new Bill(req.body);
    await bill.save();
    res.json({ success: true, id: bill._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// All bills history
app.get("/api/bills", async (req, res) => {
  try {
    const bills = await Bill.find().sort({ date: -1 }).limit(24);
    res.json(bills);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/", (req, res) => res.json({ status: "Bijli Bill API running ✅" }));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(process.env.PORT || 4000, () =>
      console.log(`Server running on port ${process.env.PORT || 4000}`)
    );
  })
  .catch(err => console.error("MongoDB error:", err));
