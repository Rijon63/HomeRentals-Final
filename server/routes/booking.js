const router = require("express").Router();
const Booking = require("../models/Booking");

// CREATE BOOKING
router.post("/create", async (req, res) => {
  try {
    const { customerId, hostId, listingId, startDate, endDate, totalPrice } = req.body;
    const newBooking = new Booking({ customerId, hostId, listingId, startDate, endDate, totalPrice, paymentStatus: "pending" });
    await newBooking.save();
    res.status(200).json(newBooking);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Fail to create a new Booking!", error: err.message });
  }
});

// GET BOOKING BY ID
router.get("/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate("listingId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Fail to fetch booking", error: err.message });
  }
});

// PAYMENT SUCCESS CALLBACK
router.get("/payment-success", async (req, res) => {
  try {
    const { transaction_uuid, bookingId } = req.query; // Assume E-Sewa sends bookingId
    // Verify payment with E-Sewa API (requires actual API call)
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    booking.paymentStatus = "completed";
    await booking.save();
    res.redirect("/"); // Redirect to home page
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Payment verification failed", error: err.message });
  }
});

// PAYMENT FAILURE CALLBACK
router.get("/payment-failure", async (req, res) => {
  try {
    const { transaction_uuid, bookingId } = req.query;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    booking.paymentStatus = "failed";
    await booking.save();
    res.redirect("/"); // Redirect to home page
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Payment failed", error: err.message });
  }
});

module.exports = router;