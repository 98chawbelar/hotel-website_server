const Revenue = require("./revenue.model");

const getRevenueAnalytics = async (req, res) => {
  try {
    // TOTAL REVENUE
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

    // MONTHLY REVENUE
    const monthlyRevenue = await Revenue.aggregate([
      {
        $match: {
          status: "completed",
        },
      },
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

    // WEEKLY REVENUE (Current Week)
    const startOfWeek = new Date();

    startOfWeek.setHours(0, 0, 0, 0);

    const day = startOfWeek.getDay();

    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);

    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);

    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const weeklyRevenue = await Revenue.aggregate([
      {
        $match: {
          status: "completed",

          transactionDate: {
            $gte: startOfWeek,
            $lt: endOfWeek,
          },
        },
      },

      {
        $group: {
          _id: {
            dayOfWeek: {
              $dayOfWeek: "$transactionDate",
            },
          },

          total: {
            $sum: "$amount",
          },
        },
      },

      {
        $sort: {
          "_id.dayOfWeek": 1,
        },
      },
    ]);

    // Convert to Monday-Sunday format
    const weekTemplate = [
      { day: "Mon", total: 0 },
      { day: "Tue", total: 0 },
      { day: "Wed", total: 0 },
      { day: "Thu", total: 0 },
      { day: "Fri", total: 0 },
      { day: "Sat", total: 0 },
      { day: "Sun", total: 0 },
    ];

    weeklyRevenue.forEach((item) => {
      const mongoDay = item._id.dayOfWeek;

      const dayIndex = mongoDay === 1 ? 6 : mongoDay - 2;

      weekTemplate[dayIndex].total = item.total;
    });

    res.status(200).json({
      totalRevenue: totalRevenue[0]?.total || 0,

      monthlyRevenue,

      weeklyRevenue: weekTemplate,
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
