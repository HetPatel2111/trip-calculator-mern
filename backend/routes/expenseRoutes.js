const express = require("express");
const Expense = require("../models/Expense");
const Trip = require("../models/Trip");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ADD EXPENSE TO TRIP
router.post("/:tripId", authMiddleware, async (req, res) => {
  try {
    const { title, totalAmount, paidBy, splitType, splits } = req.body;
    const { tripId } = req.params;

    if (!title || !totalAmount || !paidBy || !splitType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // ensure user is member of trip
    const isMember = trip.members.some(
  (memberId) => memberId.toString() === req.user.userId
);

if (!isMember) {
  return res.status(403).json({ message: "Not a trip member" });
}


    let finalSplits = [];

    if (splitType === "equal") {
      const perPerson = totalAmount / trip.members.length;

      finalSplits = trip.members.map((memberId) => ({
        userId: memberId,
        amount: perPerson
      }));
    }

    if (splitType === "custom") {
      if (!splits || splits.length === 0) {
        return res.status(400).json({ message: "Splits required for custom split" });
      }

      const sum = splits.reduce((acc, s) => acc + s.amount, 0);

      if (sum !== totalAmount) {
        return res.status(400).json({ message: "Split total must equal amount" });
      }

      finalSplits = splits;
    }

    const expense = new Expense({
      tripId,
      title,
      totalAmount,
      paidBy,
      splitType,
      splits: finalSplits
    });

    await expense.save();

    res.status(201).json({
      message: "Expense added",
      expense
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET TRIP SUMMARY (WITH USER NAMES)
router.get("/summary/:tripId", authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.params;

    const expenses = await Expense.find({ tripId });

    let balances = {};

    expenses.forEach((expense) => {
      // paid amount
      balances[expense.paidBy] =
        (balances[expense.paidBy] || 0) + expense.totalAmount;

      // split amounts
      expense.splits.forEach((split) => {
        balances[split.userId] =
          (balances[split.userId] || 0) - split.amount;
      });
    });

    let creditors = [];
    let debtors = [];

    Object.keys(balances).forEach((userId) => {
      if (balances[userId] > 0) {
        creditors.push({ userId, amount: balances[userId] });
      } else if (balances[userId] < 0) {
        debtors.push({ userId, amount: -balances[userId] });
      }
    });

    let settlements = [];
    let i = 0,
      j = 0;

    while (i < debtors.length && j < creditors.length) {
      const minAmount = Math.min(
        debtors[i].amount,
        creditors[j].amount
      );

      settlements.push({
        from: debtors[i].userId,
        to: creditors[j].userId,
        amount: minAmount
      });

      debtors[i].amount -= minAmount;
      creditors[j].amount -= minAmount;

      if (debtors[i].amount === 0) i++;
      if (creditors[j].amount === 0) j++;
    }

    // 🔥 FETCH USER NAMES
    const userIds = [
      ...new Set(
        settlements.flatMap((s) => [s.from.toString(), s.to.toString()])
      )
    ];

    const users = await require("../models/User")
      .find({ _id: { $in: userIds } })
      .select("name");

    const userMap = {};
    users.forEach((u) => {
      userMap[u._id] = u.name;
    });

    const finalSettlements = settlements.map((s) => ({
      from: userMap[s.from],
      to: userMap[s.to],
      amount: s.amount
    }));

    res.json({ settlements: finalSettlements });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL EXPENSES OF A TRIP
router.get("/:tripId", authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.params;

    const expenses = await Expense.find({ tripId })
      .populate("paidBy", "name email");

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
