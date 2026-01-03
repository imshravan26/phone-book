import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "../constants.js";

export const verifyJWT = async (req, res, next) => {
  try {
    // Get token from header
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies?.accessToken;

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
      });
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Get user from token
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: error?.message || ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
    });
  }
};
