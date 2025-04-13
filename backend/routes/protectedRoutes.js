const express = require("express");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Collector Dashboard (only for collectors)
router.get("/collector/dashboard", authenticate, authorize(["collector"]), (req, res) => {
    res.json({ message: "Welcome Collector!" });
});

// Residents can request waste pickup
router.post("/request-pickup", authenticate, authorize(["resident"]), (req, res) => {
    res.json({ message: "Pickup request submitted!" });
});


module.exports = router;
