const Revenue = require("./revenue.model");

const getRevenueAnalytics = async (req, res) => {
  try {
    const totalRevenue = await Revenue.aggregate([
      {
        $match: {
          status: "completed",
        },
      },

      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const monthlyRevenue = await Revenue.aggregate([
      {
        $group: {
          _id: {
            month: {
              $month: "$transactionDate",
            },
          },

          total: {
            $sum: "$amount",
          },
        },
      },

      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    res.status(200).json({
      totalRevenue: totalRevenue[0]?.total || 0,

      monthlyRevenue,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getRevenueAnalytics,
};
