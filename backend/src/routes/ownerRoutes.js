const express = require("express");
const { getOwnerDashboard } = require("../controllers/ownerController");
const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  authorize("STORE_OWNER"),
  getOwnerDashboard
);

module.exports = router;