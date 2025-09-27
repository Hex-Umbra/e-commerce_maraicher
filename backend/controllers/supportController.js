import { catchAsync, AppError } from "../utils/handleError.js";
import emailService from "../services/emailService.js";
import { logger } from "../services/logger.js";

/**
 * @desc Send a contact message to support
 * @route POST /api/support/contact
 * @access Public
 */
export const sendContactMessage = catchAsync(async (req, res, next) => {
  const subjectRaw = req.body?.subject ?? req.body?.object ?? "";
  const titleRaw = req.body?.title ?? "";
  const messageRaw = req.body?.message ?? "";

  const subject = String(subjectRaw).trim();
  const title = String(titleRaw).trim();
  const message = String(messageRaw).trim();

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
