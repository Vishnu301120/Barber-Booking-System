import nodemailer from "nodemailer";

let cachedTestTransporter = null;

/**
 * Get or create the Nodemailer transporter.
 * Supports environment SMTP configuration (e.g. Gmail, SendGrid, custom SMTP).
 * If no credentials are configured, falls back to Ethereal Email for testing.
 */
export const getTransporter = async () => {
  const service = process.env.EMAIL_SERVICE;
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
  const rawUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const rawPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  const user = rawUser ? rawUser.trim() : "";
  const pass = rawPass ? rawPass.trim().replace(/\s+/g, "") : "";

  // Use configured SMTP credentials if provided
  if (user && pass) {
    if (service && service.toLowerCase() === "gmail") {
      return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      });
    }

    return nodemailer.createTransport({
      host: host || "smtp.gmail.com",
      port,
      secure: process.env.EMAIL_SECURE === "true" || port === 465,
      auth: { user, pass },
    });
  }

  // Fallback: Automatic Ethereal test inbox for development
  if (!cachedTestTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log("--------------------------------------------------");
      console.log("⚠️  [Nodemailer Notice] EMAIL_USER / EMAIL_PASS are empty in backend/.env!");
      console.log("   Emails are currently sent to Ethereal Mock Inbox (NOT real Gmail).");
      console.log(`   Mock Account: ${testAccount.user}`);
      console.log("   👉 To deliver real emails to actual Gmail inboxes, set EMAIL_USER & EMAIL_PASS in backend/.env");
      console.log("--------------------------------------------------");
      cachedTestTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.warn("⚠️  [Nodemailer] Could not create Ethereal account:", err.message);
      return nodemailer.createTransport({
        host: host || "localhost",
        port,
        secure: false,
      });
    }
  }

  return cachedTestTransporter;
};


/**
 * Generate responsive HTML email markup for booking status updates
 */
export const generateStatusEmailHtml = (booking, status) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const customerName = booking?.user?.name || "Valued Client";
  const barberName = booking?.barber || "Our Professional Barber";
  const serviceName = booking?.service || "Grooming Service";
  const bookingDate = booking?.date || "N/A";
  const bookingTime = booking?.time || "N/A";
  const notes = booking?.notes ? booking.notes.trim() : "";

  let statusConfig = {
    title: "Appointment Status Update",
    badgeText: status ? status.toUpperCase() : "UPDATED",
    badgeBg: "#f3f4f6",
    badgeColor: "#374151",
    accentColor: "#d4af37",
    headline: "Your Appointment Has Been Updated",
    introMessage: "There is an update regarding your barber appointment.",
    ctaText: "View My Appointments",
    ctaUrl: `${clientUrl}/profile`,
    subject: `Appointment Update: ${serviceName} on ${bookingDate}`,
  };

  if (status === "pending") {
    statusConfig = {
      title: "Appointment Received",
      badgeText: "PENDING CONFIRMATION",
      badgeBg: "#fef3c7",
      badgeColor: "#92400e",
      accentColor: "#f59e0b",
      headline: "Appointment Request Received! 📋",
      introMessage:
        "Thank you for scheduling with us! We have received your booking request. Our team will review and confirm your slot shortly.",
      ctaText: "View My Appointments",
      ctaUrl: `${clientUrl}/profile`,
      subject: `📋 Appointment Received: ${serviceName} on ${bookingDate} at ${bookingTime}`,
      extraNote:
        "You will receive an update email once your appointment is confirmed. You can also track your booking in your profile.",
    };
  } else if (status === "confirmed") {
    statusConfig = {
      title: "Appointment Confirmed",
      badgeText: "CONFIRMED",

      badgeBg: "#dcfce7",
      badgeColor: "#15803d",
      accentColor: "#16a34a",
      headline: "Your Appointment is Confirmed! ✂️",
      introMessage:
        "Great news! Your booking has been confirmed by our team. We've reserved your slot and our barber is getting ready for you.",
      ctaText: "View Appointment Details",
      ctaUrl: `${clientUrl}/profile`,
      subject: `✂️ Booking Confirmed: ${serviceName} on ${bookingDate} at ${bookingTime}`,
      extraNote:
        "Please arrive 5 to 10 minutes early. If you need to make changes or have questions, feel free to contact us.",
    };
  } else if (status === "completed") {
    statusConfig = {
      title: "Appointment Completed",
      badgeText: "COMPLETED",
      badgeBg: "#e0e7ff",
      badgeColor: "#4338ca",
      accentColor: "#6366f1",
      headline: "Thank You for Visiting Us! ⭐",
      introMessage:
        "Your appointment has been marked as completed. We hope you enjoyed your fresh cut and premium grooming experience!",
      ctaText: "Book Your Next Appointment",
      ctaUrl: `${clientUrl}/booking`,
      subject: `⭐ Thank You for Your Visit! - ${serviceName}`,
      extraNote:
        "We always strive to deliver the highest quality service. Keep looking sharp and we look forward to welcoming you back soon!",
    };
  } else if (status === "cancelled") {
    statusConfig = {
      title: "Appointment Cancelled",
      badgeText: "CANCELLED",
      badgeBg: "#fee2e2",
      badgeColor: "#b91c1c",
      accentColor: "#ef4444",
      headline: "Appointment Cancelled",
      introMessage:
        "We are writing to notify you that your booking has been cancelled.",
      ctaText: "Reschedule / Book New Slot",
      ctaUrl: `${clientUrl}/booking`,
      subject: `Appointment Cancelled: ${serviceName} on ${bookingDate}`,
      extraNote:
        "If you did not request this cancellation or would like to book for another day and time, please click the button below to reserve a new slot.",
    };
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${statusConfig.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f1115; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f1115; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #1a1d24; border-radius: 12px; overflow: hidden; border: 1px solid #2a2f3a; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 30px 24px 30px; text-align: center; background: linear-gradient(135deg, #1f242d 0%, #161920 100%); border-bottom: 2px solid ${statusConfig.accentColor};">
              <div style="font-size: 26px; font-weight: 800; letter-spacing: 2px; color: #d4af37; text-transform: uppercase;">
                ✂️ BARBER SHOP
              </div>
              <div style="font-size: 13px; color: #9ca3af; letter-spacing: 1px; margin-top: 4px; text-transform: uppercase;">
                Premium Grooming Lounge
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 30px;">
              <!-- Status Badge -->
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 1px; background-color: ${statusConfig.badgeBg}; color: ${statusConfig.badgeColor};">
                  ${statusConfig.badgeText}
                </span>
              </div>

              <!-- Greeting & Headline -->
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #ffffff; text-align: center;">
                ${statusConfig.headline}
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #d1d5db; text-align: center;">
                Hello <strong>${customerName}</strong>,<br />
                ${statusConfig.introMessage}
              </p>

              <!-- Appointment Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #12141a; border-radius: 10px; border: 1px solid #262b35; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 12px; font-weight: 700; color: #9ca3af; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #262b35; padding-bottom: 8px;">
                      Appointment Summary
                    </div>
                    
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="6" border="0">
                      <tr>
                        <td width="35%" style="color: #9ca3af; font-size: 14px;">Service:</td>
                        <td width="65%" style="color: #ffffff; font-size: 14px; font-weight: 600;">${serviceName}</td>
                      </tr>
                      <tr>
                        <td style="color: #9ca3af; font-size: 14px;">Barber:</td>
                        <td style="color: #ffffff; font-size: 14px; font-weight: 600;">${barberName}</td>
                      </tr>
                      <tr>
                        <td style="color: #9ca3af; font-size: 14px;">Date:</td>
                        <td style="color: #ffffff; font-size: 14px; font-weight: 600;">📅 ${bookingDate}</td>
                      </tr>
                      <tr>
                        <td style="color: #9ca3af; font-size: 14px;">Time Slot:</td>
                        <td style="color: #ffffff; font-size: 14px; font-weight: 600;">⏰ ${bookingTime}</td>
                      </tr>
                      ${
                        notes
                          ? `<tr>
                              <td style="color: #9ca3af; font-size: 14px; vertical-align: top;">Notes:</td>
                              <td style="color: #d1d5db; font-size: 14px; font-style: italic;">${notes}</td>
                            </tr>`
                          : ""
                      }
                      <tr>
                        <td style="color: #9ca3af; font-size: 14px;">Status:</td>
                        <td style="color: ${statusConfig.accentColor}; font-size: 14px; font-weight: 700; text-transform: capitalize;">${status}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Extra Note / Instructions -->
              ${
                statusConfig.extraNote
                  ? `<div style="background-color: #212631; border-left: 3px solid ${statusConfig.accentColor}; padding: 14px 16px; border-radius: 4px; margin-bottom: 24px; font-size: 13px; color: #e5e7eb; line-height: 1.5;">
                      ${statusConfig.extraNote}
                    </div>`
                  : ""
              }

              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 28px; margin-bottom: 10px;">
                <a href="${statusConfig.ctaUrl}" target="_blank" style="display: inline-block; background-color: ${statusConfig.accentColor}; color: #ffffff; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 700; text-decoration: none; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                  ${statusConfig.ctaText}
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; text-align: center; background-color: #12141a; border-top: 1px solid #232730; font-size: 12px; color: #6b7280; line-height: 1.6;">
              <p style="margin: 0 0 6px 0;">Barber Shop &bull; Premium Grooming &bull; Always Sharp</p>
              <p style="margin: 0;">This is an automated notification. If you have questions, please reach out via our contact page.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Barber Shop - ${statusConfig.title}
==========================================

Hello ${customerName},

${statusConfig.introMessage}

Appointment Details:
- Service: ${serviceName}
- Barber: ${barberName}
- Date: ${bookingDate}
- Time: ${bookingTime}
- Status: ${status}
${notes ? `- Notes: ${notes}\n` : ""}

${statusConfig.extraNote ? `${statusConfig.extraNote}\n` : ""}
Visit your dashboard: ${statusConfig.ctaUrl}

---
Barber Shop Grooming Lounge
  `.trim();

  return {
    subject: statusConfig.subject,
    html,
    text,
  };
};

/**
 * Send an email notification for a booking status change.
 * Supported statuses: "confirmed", "completed", "cancelled"
 *
 * @param {Object} booking - Booking document (with user populated or user object)
 * @param {String} status - "confirmed" | "completed" | "cancelled"
 * @returns {Promise<Object>} info result of nodemailer sendMail
 */
export const sendBookingStatusEmail = async (booking, status) => {
  try {
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      console.log(`ℹ️ [Nodemailer] Status "${status}" does not trigger an email. Skipped.`);
      return null;
    }

    const recipientEmail = booking?.user?.email;
    if (!recipientEmail) {
      console.warn("⚠️ [Nodemailer] Cannot send email: booking user has no email address.");
      return null;
    }

    const transporter = await getTransporter();
    const { subject, html, text } = generateStatusEmailHtml(booking, status);

    const fromAddress =
      process.env.EMAIL_FROM ||
      (process.env.EMAIL_USER
        ? `"Barber Shop" <${process.env.EMAIL_USER}>`
        : '"Barber Shop" <bookings@barbershop.com>');

    const mailOptions = {
      from: fromAddress,
      to: recipientEmail,
      subject,
      text,
      html,
    };

    const isTestAccount = !process.env.EMAIL_USER || !process.env.EMAIL_PASS;
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Nodemailer] Status "${status}" email sent to ${recipientEmail} (Message ID: ${info.messageId})`);

    // If using Ethereal test account, print preview URL to terminal
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [Nodemailer Preview URL]: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
      status,
      recipient: recipientEmail,
      isTestAccount,
    };
  } catch (error) {
    console.error(`❌ [Nodemailer] Error sending ${status} email:`, error.message);
    // Return error information without throwing, so business logic isn't interrupted
    return {
      success: false,
      error: error.message,
    };
  }
};


// Convenience helpers
export const sendConfirmationEmail = (booking) =>
  sendBookingStatusEmail(booking, "confirmed");

export const sendCompletionEmail = (booking) =>
  sendBookingStatusEmail(booking, "completed");

export const sendCancellationEmail = (booking) =>
  sendBookingStatusEmail(booking, "cancelled");

export default {
  getTransporter,
  generateStatusEmailHtml,
  sendBookingStatusEmail,
  sendConfirmationEmail,
  sendCompletionEmail,
  sendCancellationEmail,
};
