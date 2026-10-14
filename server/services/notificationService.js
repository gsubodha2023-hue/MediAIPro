import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendEmail } from "./emailService.js";

// Called from other controllers (appointments, records, etc.) whenever
// something happens that the user should be told about. Creates the in-app
// notification and fires off an email in parallel - if the email fails, the
// in-app notification (and whatever triggered this) still succeeds.
export const notify = async ({ userId, title, message, type = "system", relatedId, sendEmailToo = true }) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    relatedId,
  });

  if (sendEmailToo) {
    const user = await User.findById(userId).select("email name");
    if (user?.email) {
      // Fire-and-forget: don't block/fail the caller if email sending is slow or fails
      sendEmail({ to: user.email, subject: title, text: message }).catch(() => {});
    }
  }

  return notification;
};
