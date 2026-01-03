import { User } from "../models/user.model.js";
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(
      "Something went wrong while generating refresh and access token"
    );
  }
};

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if ([fullName, email, password].some((field) => field?.trim() === "")) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: ERROR_MESSAGES.USER_EXISTS,
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
    });

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    // Get user without password and refreshToken
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // Cookie options
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(HTTP_STATUS.CREATED)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        data: {
          user: createdUser,
          accessToken,
          refreshToken,
        },
        message: SUCCESS_MESSAGES.USER_REGISTERED,
      });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      });
    }

    // Check password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    // Get user without password and refreshToken
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // Cookie options
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(HTTP_STATUS.OK)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        data: {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        message: SUCCESS_MESSAGES.USER_LOGGED_IN,
      });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(HTTP_STATUS.OK)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        success: true,
        message: "User logged out successfully",
      });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        user: req.user,
      },
      message: "User fetched successfully",
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
      });
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
      });
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Refresh token is expired or used",
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(HTTP_STATUS.OK)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        data: {
          accessToken,
          refreshToken,
        },
        message: "Access token refreshed",
      });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: error?.message || "Invalid refresh token",
    });
  }
};
