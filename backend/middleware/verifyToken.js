import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;

    next(); // ✅ now works
  } catch (error) {
    console.log("Error in verifyToken ", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};