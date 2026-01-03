import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  validateUserRegistration,
  validateUserLogin,
} from "../middlewares/validation.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(validateUserRegistration, registerUser);
router.route("/login").post(validateUserLogin, loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/profile").get(verifyJWT, getCurrentUser);

export default router;
