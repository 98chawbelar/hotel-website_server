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

  const subtotal = roomPrice * nights;

  const config = await Price.findOne({ active: true });

  let discount = 0;

  if (nights >= 30) {
    discount = subtotal * ((config?.monthlyDiscountPercent || 0) / 100);
  } else if (nights >= 7) {
    discount = subtotal * ((config?.weeklyDiscountPercent || 0) / 100);
  }

  const tax = subtotal * ((config?.taxPercent || 0) / 100);

  const serviceFee = subtotal * ((config?.serviceFeePercent || 0) / 100);

  const totalPrice = subtotal + extrasTotal + tax + serviceFee - discount;

  return {
    nights,
    roomPrice,

    subtotal,

    discount: Math.round(discount),

    tax: Math.round(tax),

    serviceFee: Math.round(serviceFee),

    extrasTotal,

    totalPrice: Math.round(totalPrice),

    currency: config?.currency || "MMK",
  };
};

module.exports = calculateBookingPrice;
