const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendBookingConfirmation = async (booking) => {
  try {
    const confirmationLink = `${process.env.CLIENT_PORT}/confirmation/${booking.bookingCode}`;

    await resend.emails.send({
      from: "Kandaw101 Hotel <onboarding@resend.dev>",

      to: booking.guest.email,

      subject: "Booking Confirmed - Kandaw101 Hotel",

      html: `

      <div style="font-family:Arial;padding:30px">

        <h2>
          Booking Confirmed Successfully 🎉
        </h2>


        <p>
          Dear ${booking.guest.firstName}
          ${booking.guest.lastName},
        </p>


        <p>
          Your hotel booking has been confirmed.
        </p>



        <h3>
          Booking Information
        </h3>


        <p>
          <b>Booking Code:</b>
          ${booking.bookingCode}
        </p>


        <p>
          <b>Room:</b>
          ${booking.room?.name}
        </p>


        <p>
          <b>Room Number:</b>
          ${booking.room?.roomNumber || "Assigned"}
        </p>


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
          ${booking.pricing.totalPrice}
          ${booking.pricing.currency}
        </p>



        <br/>


        <a
        href="${confirmationLink}"
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


        <p>
          Thank you for choosing Kandaw101 Hotel.
        </p>


      </div>

      `,
    });

    console.log("Confirmation email sent:", booking.guest.email);
  } catch (error) {
    console.error("Email Error:", error.message);
  }
};

module.exports = sendBookingConfirmation;
