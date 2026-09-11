const prisma = require("../config/prisma");
const {
  isValidEmail,
} = require("../utils/validation");

const validateStoreData = ({ name, email, address }) => {
  if (!name || !email || !address) {
    return "Name, email and address are required";
  }

  if (name.length < 20 || name.length > 60) {
    return "Name must be between 20 and 60 characters";
  }

  if (address.length > 400) {
    return "Address must not exceed 400 characters";
  }

  if (!isValidEmail(email)) {
    return "Please provide a valid email address";
  }

  return null;
};

const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const validationError = validateStoreData({
      name,
      email,
      address,
    });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    if (ownerId) {
      const owner = await prisma.user.findUnique({
        where: {
          id: Number(ownerId),
        },
      });

      if (!owner) {
        return res.status(404).json({
          message: "Store owner not found",
        });
      }

      if (owner.role !== "STORE_OWNER") {
        return res.status(400).json({
          message: "Selected user is not a store owner",
        });
      }

      const existingStore = await prisma.store.findUnique({
        where: {
          ownerId: Number(ownerId),
        },
      });

      if (existingStore) {
        return res.status(409).json({
          message: "This store owner already has a store",
        });
      }
    }

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId: ownerId ? Number(ownerId) : null,
      },
    });

    res.status(201).json({
      message: "Store created successfully",
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create store",
    });
  }
};

const getStores = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    const validSortFields = [
      "name",
      "email",
      "address",
      "rating",
    ];

    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({
        message: "Invalid sort field",
      });
    }

    const order = sortOrder.toLowerCase() === "desc"
      ? "desc"
      : "asc";

    const stores = await prisma.store.findMany({
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
      },
      include: {
        ratings: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: sortBy === "rating"
  ? { name: "asc" }
  : { [sortBy]: order },
    });

    const formattedStores = stores.map((store) => {
      const totalRatings = store.ratings.length;

      const averageRating =
        totalRatings === 0
          ? 0
          : store.ratings.reduce(
              (sum, item) => sum + item.rating,
              0
            ) / totalRatings;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        rating: Number(averageRating.toFixed(2)),
      };
    });

    if (sortBy === "rating") {
      formattedStores.sort((a, b) => {
        return order === "asc"
          ? a.rating - b.rating
          : b.rating - a.rating;
      });
    }

    res.json({
      stores: formattedStores,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load stores",
    });
  }
};

const getStoresForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      address,
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    const validSortFields = [
      "name",
      "address",
      "overallRating",
    ];

    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({
        message: "Invalid sort field",
      });
    }

    const order = sortOrder.toLowerCase() === "desc"
      ? "desc"
      : "asc";

    const stores = await prisma.store.findMany({
      where: {
        ...(name && {
          name: {
            contains: name,
          },
        }),
        ...(address && {
          address: {
            contains: address,
          },
        }),
      },
      include: {
        ratings: {
          select: {
            rating: true,
            userId: true,
          },
        },
      },
      orderBy: {
        [sortBy === "overallRating" ? "name" : sortBy]: order,
      },
    });

    const formattedStores = stores.map((store) => {
      const totalRatings = store.ratings.length;

      const averageRating =
        totalRatings === 0
          ? 0
          : store.ratings.reduce(
              (sum, item) => sum + item.rating,
              0
            ) / totalRatings;

      const userRating = store.ratings.find(
        (item) => item.userId === userId
      );

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        overallRating: Number(
          averageRating.toFixed(2)
        ),
        userSubmittedRating: userRating
          ? userRating.rating
          : null,
      };
    });

    if (sortBy === "overallRating") {
      formattedStores.sort((a, b) => {
        return order === "asc"
          ? a.overallRating - b.overallRating
          : b.overallRating - a.overallRating;
      });
    }

    res.json({
      stores: formattedStores,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load stores",
    });
  }
};

module.exports = {
  createStore,
  getStores,
  getStoresForUser,
};