const prisma = require("../config/prisma");

const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const store = await prisma.store.findUnique({
      where: {
        ownerId,
      },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({
        message: "No store found for this owner",
      });
    }

    const totalRatings = store.ratings.length;

    const averageRating =
      totalRatings === 0
        ? 0
        : store.ratings.reduce(
            (sum, item) => sum + item.rating,
            0
          ) / totalRatings;

    const ratings = store.ratings.map((item) => ({
      userId: item.user.id,
      userName: item.user.name,
      userEmail: item.user.email,
      rating: item.rating,
    }));

    res.json({
      store: {
        id: store.id,
        name: store.name,
        address: store.address,
      },
      averageRating: Number(averageRating.toFixed(2)),
      totalRatings,
      ratings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load owner dashboard",
    });
  }
};

module.exports = {
  getOwnerDashboard,
};