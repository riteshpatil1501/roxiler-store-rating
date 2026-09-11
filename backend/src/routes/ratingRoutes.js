const express = require("express");
const { submitRating } = require("../controllers/ratingController");
const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("USER"),
  submitRating
);

module.exports = router;