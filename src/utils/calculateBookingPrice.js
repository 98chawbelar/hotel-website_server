const Price = require("../pricing/price.model");

const calculateBookingPrice = async ({
  roomPrice,
  checkIn,
  checkOut,
  extrasTotal = 0,
}) => {
  if (!roomPrice) {
    throw new Error("Room Price is required");
  }

  const nights = Math.ceil(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24),
  );

  if (nights <= 0) {
    throw new Error("Invalid booking dates");
  }

  const subtotal = roomPrice * nights;

  const config = await Price.findOne({
    active: true,
  });

  let weeklyDiscount = 0;
  let monthlyDiscount = 0;

  if (nights >= 30) {
    monthlyDiscount = subtotal * ((config?.monthlyDiscountPercent || 0) / 100);
  } else if (nights >= 7) {
    weeklyDiscount = subtotal * ((config?.weeklyDiscountPercent || 0) / 100);
  }

  const discountedSubtotal = subtotal - weeklyDiscount - monthlyDiscount;

  const taxAmount = discountedSubtotal * ((config?.taxPercent || 0) / 100);

  const serviceFee =
    discountedSubtotal * ((config?.serviceFeePercent || 0) / 100);

  const totalPrice = discountedSubtotal + taxAmount + serviceFee + extrasTotal;

  return {
    nights,

    roomPrice,

    subtotal,

    weeklyDiscount: Math.round(weeklyDiscount),

    monthlyDiscount: Math.round(monthlyDiscount),

    taxAmount: Math.round(taxAmount),

    serviceFee: Math.round(serviceFee),

    extrasTotal: Math.round(extrasTotal),

    totalPrice: Math.round(totalPrice),

    currency: config?.currency || "Ks",
  };
};

module.exports = calculateBookingPrice;
