const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const {
  isValidPassword,
  isValidEmail,
} = require("../utils/validation");

const getDashboard = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalRatings = await prisma.rating.count();

    res.json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    if (!name || !email || !address || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({
        message: "Name must be between 20 and 60 characters",
      });
    }

    if (address.length > 400) {
      return res.status(400).json({
        message: "Address must not exceed 400 characters",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters and contain at least one uppercase letter and one special character",
      });
    }

    const validRoles = ["ADMIN", "USER", "STORE_OWNER"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        address,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create user",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      role,
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    const validSortFields = ["name", "email", "address", "role"];

    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({
        message: "Invalid sort field",
      });
    }

    const order = sortOrder.toLowerCase() === "desc" ? "desc" : "asc";

    const users = await prisma.user.findMany({
      where: {
        ...(name && {
          name: {
            contains: name,
          },
        }),
        ...(email && {
          email: {
            contains: email,
          },
        }),
        ...(address && {
          address: {
            contains: address,
          },
        }),
        ...(role && {
          role,
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
      },
      orderBy: {
        [sortBy]: order,
      },
    });

    res.json({
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load users",
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        store: {
          include: {
            ratings: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let storeRating = null;

    if (user.store) {
      const ratings = user.store.ratings;

      storeRating =
        ratings.length === 0
          ? 0
          : Number(
              (
                ratings.reduce(
                  (sum, item) => sum + item.rating,
                  0
                ) / ratings.length
              ).toFixed(2)
            );
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        storeRating,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load user details",
    });
  }
};

module.exports = {
  getDashboard,
  createUser,
  getUsers,
  getUserDetails,
};