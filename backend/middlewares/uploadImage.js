import multer from "multer";

const storage = multer.memoryStorage();

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Allowed image mime types
const ALLOWED_MIME = /^(image\/jpeg|image\/png|image\/webp|image\/gif|image\/svg\+xml)$/i;

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.test(file.mimetype)) {
    return cb(
      new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Le type de fichier image n'est pas autorisé")
    );
  }
  cb(null, true);
}

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});
