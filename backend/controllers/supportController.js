import { catchAsync, AppError } from "../utils/handleError.js";
import emailService from "../services/emailService.js";
import { logger } from "../services/logger.js";
import { sanitizeSupportInput } from "../utils/sanitize.js";

/**
 * @desc Send a contact message to support
 * @route POST /api/support/contact
 * @access Public
 */
export const sendContactMessage = catchAsync(async (req, res, next) => {
  const subjectRaw = req.body?.subject ?? req.body?.object ?? "";
  const titleRaw = req.body?.title ?? "";
  const messageRaw = req.body?.message ?? "";

  // Sanitize all inputs
  const sanitized = sanitizeSupportInput({
    subject: subjectRaw,
    object: subjectRaw,
    title: titleRaw,
    message: messageRaw,
  });

  const subject = sanitized.subject || sanitized.object || "";
  const title = sanitized.title || "";
  const message = sanitized.message || "";

  if (!subject || !title || !message) {
    return next(
      new AppError(
        "Les champs 'subject/object', 'title' et 'message' sont requis.",
        400
      )
    );
  }

  await emailService.sendSupportContact(subject, title, message);

  logger.info(`Support contact message sent: ${subject} - ${title}`);

  res.status(200).json({
    status: "success",
    message: "Votre message a été envoyé au support.",
  });
});
