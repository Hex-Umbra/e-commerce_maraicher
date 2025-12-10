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
  const userEmailRaw = req.body?.userEmail ?? "";
  const userNameRaw = req.body?.userName ?? "";
  const userId = req.body?.userId ?? null;

  // Sanitize all inputs
  const sanitized = sanitizeSupportInput({
    subject: subjectRaw,
    object: subjectRaw,
    title: titleRaw,
    message: messageRaw,
    userEmail: userEmailRaw,
    userName: userNameRaw,
  });

  const subject = sanitized.subject || sanitized.object || "";
  const title = sanitized.title || "";
  const message = sanitized.message || "";
  const userEmail = sanitized.userEmail || "";
  const userName = sanitized.userName || "Utilisateur anonyme";

  if (!subject || !title || !message || !userEmail) {
    return next(
      new AppError(
        "Les champs 'subject/object', 'title', 'userEmail' et 'message' sont requis.",
        400
      )
    );
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    return next(new AppError("Adresse email invalide.", 400));
  }

  await emailService.sendSupportContact(subject, title, message, userEmail, userName, userId);

  logger.info(`Support contact message sent: ${subject} - ${title} from ${userEmail}`);

  res.status(200).json({
    status: "success",
    message: "Votre message a été envoyé au support.",
  });
});
