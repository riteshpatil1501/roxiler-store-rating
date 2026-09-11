const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const prisma = require("./config/prisma");
const authRoutes = require("./routes/authRoutes");
const { authenticate, authorize } = require("./middleware/authMiddleware");
const adminRoutes = require("./routes/adminRoutes");
const storeRoutes = require("./routes/storeRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/owner", ownerRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Roxiler Store Rating API is running",
  });
});
app.get("/api/test-db", async (req, res) => {
  try {
    const userCount = await prisma.user.count();

    res.json({
      message: "Database connection successful",
      userCount,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});
app.get(
  "/api/protected-test",
  authenticate,
  authorize("ADMIN"),
  (req, res) => {
  res.json({
    message: "You accessed a protected route",
    user: req.user,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
