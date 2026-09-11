const prisma = require("../config/prisma");

const submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;

    const userId = req.user.id;

    if (!storeId || rating === undefined) {
      return res.status(400).json({
        message: "Store ID and rating are required",
      });
    }

    const numericStoreId = Number(storeId);
    const numericRating = Number(rating);

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const store = await prisma.store.findUnique({
      where: {
        id: numericStoreId,
      },
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId: numericStoreId,
        },
      },
    });

    let savedRating;

    if (existingRating) {
      savedRating = await prisma.rating.update({
        where: {
          id: existingRating.id,
        },
        data: {
          rating: numericRating,
        },
      });
    } else {
      savedRating = await prisma.rating.create({
        data: {
          userId,
          storeId: numericStoreId,
          rating: numericRating,
        },
      });
    }

    res.json({
      message: existingRating
        ? "Rating updated successfully"
        : "Rating submitted successfully",
      rating: savedRating.rating,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to submit rating",
    });
  }
};

module.exports = {
  submitRating,
};