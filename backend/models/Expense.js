const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    splitType: {
      type: String,
      enum: ["equal", "custom"],
      required: true
    },
    splits: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        amount: {
          type: Number
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
