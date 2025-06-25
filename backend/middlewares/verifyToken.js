import jwt from "jsonwebtoken";

export const verifyToken = (res, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Accès non autorisé, token manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Token invalide ou expiré, veuillez vous reconnecter",
      error: error.message,
    });
  }
};
