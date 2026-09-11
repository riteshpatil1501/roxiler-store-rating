const express = require("express");
const {
  createStore,
  getStores,
  getStoresForUser,
} = require("../controllers/storeController");
const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createStore
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  getStores
);

router.get(
  "/user",
  authenticate,
  authorize("USER"),
  getStoresForUser
);

module.exports = router;