const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingConfirmation = async (booking) => {
  try {
    const userdashboardLink = `${process.env.CLIENT_URL}/userdashboard`;

    const mailOptions = {
      from: `"Kandaw101 Hotel" <${process.env.EMAIL_USER}>`,
      to: booking.guest.email,
      subject: "Booking Confirmed - Kandaw101 Hotel",

      html: `
        <div style="font-family:Arial;padding:30px">
          <h2>Booking Confirmed Successfully 🎉</h2>

          <p>
            Dear ${booking.guest.firstName} ${booking.guest.lastName},
          </p>

          <p>Your booking has been confirmed.</p>

          <p><b>Booking Code:</b> ${booking.bookingCode}</p>
          <p><b>Room:</b> ${booking.room?.name}</p>

          <p>
            <b>Check In:</b>
            ${new Date(booking.stay.checkIn).toLocaleDateString()}
          </p>

          <p>
            <b>Check Out:</b>
            ${new Date(booking.stay.checkOut).toLocaleDateString()}
          </p>

          <p>
            <b>Total:</b>
            ${booking.pricing.totalPrice} ${booking.pricing.currency}
          </p>

          <br/>

          <a
            href="${userdashboardLink}"
            style="
              background:#2563eb;
              color:white;
              padding:12px 20px;
              border-radius:8px;
              text-decoration:none;
            "
          >
            View Booking Details
          </a>

          <br/><br/>

          <p>Thank you for choosing Kandaw101 Hotel.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Email Error:", error);
  }
};

module.exports = sendBookingConfirmation;
