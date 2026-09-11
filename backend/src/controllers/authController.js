const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");

const {
  isValidPassword,
  isValidEmail,
} = require("../utils/validation");

const signup = async (req, res) => {
  try {
    const { name, email, address, password } = req.body;

if (!isValidPassword(password)) {
  return res.status(400).json({
    message:
      "Password must be 8-16 characters and contain at least one uppercase letter and one special character",
  });
}

    // Basic validation
    if (!name || !email || !address || !password) {
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

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        address,
        password: hashedPassword,
        role: "USER",
      },
    });

    // Don't send password back
    res.status(201).json({
      message: "User registered successfully",
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
      message: "Something went wrong",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
    {
        id: user.id,
        role: user.role,
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "1d",
    }
    );

    res.json({
    message: "Login successful",
    token,
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
      message: "Something went wrong",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be 8-16 characters and contain at least one uppercase letter and one special character",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to change password",
    });
  }
};

module.exports = {
  signup,
  login,
  changePassword,
};