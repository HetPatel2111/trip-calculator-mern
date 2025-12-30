const express = require("express");
const Trip = require("../models/Trip");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// helper function to generate trip code
const generateTripCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// CREATE TRIP
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { name, currency } = req.body;

    if (!name || !currency) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let tripCode;
    let existingTrip;

    // ensure unique trip code
    do {
      tripCode = generateTripCode();
      existingTrip = await Trip.findOne({ tripCode });
    } while (existingTrip);

    const newTrip = new Trip({
      name,
      currency,
      tripCode,
      members: [req.user.userId],
      createdBy: req.user.userId
    });

    await newTrip.save();

    res.status(201).json({
      message: "Trip created successfully",
      trip: newTrip
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// JOIN TRIP USING CODE
router.post("/join", authMiddleware, async (req, res) => {
  try {
    const { tripCode } = req.body;

    if (!tripCode) {
      return res.status(400).json({ message: "Trip code is required" });
    }

    const trip = await Trip.findOne({ tripCode });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // check if user already joined
    if (trip.members.includes(req.user.userId)) {
      return res.status(400).json({ message: "Already a member of this trip" });
    }

    trip.members.push(req.user.userId);
    await trip.save();

    res.json({
      message: "Joined trip successfully",
      trip
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET MY TRIPS
router.get("/my-trips", authMiddleware, async (req, res) => {
  try {
    const trips = await Trip.find({
      members: req.user.userId
    });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET SINGLE TRIP DETAILS
router.get("/:tripId", authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
      .populate("members", "name email");

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // ensure user is member
    if (!trip.members.some(m => m._id.toString() === req.user.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;
