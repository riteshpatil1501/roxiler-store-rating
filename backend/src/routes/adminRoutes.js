const express = require("express");

const {
  getDashboard,
  createUser,
  getUsers,
  getUserDetails,
} = require("../controllers/adminController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  authorize("ADMIN"),
  getDashboard
);

router.post(
  "/users",
  authenticate,
  authorize("ADMIN"),
  createUser
);

router.get(
  "/users",
  authenticate,
  authorize("ADMIN"),
  getUsers
);

router.get(
  "/users/:id",
  authenticate,
  authorize("ADMIN"),
  getUserDetails
);

module.exports = router;