import { Request, Response } from "express";
import catchAsync from "../../utility/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utility/sendResponse";
import httpStatus from "http-status";
import config from "../../config";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  await authService.registerUser(payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Check Your Email",
    data: null,
  });
});

const verifyUserEmail = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  console.log("payload", payload);

  const result = await authService.verifyUserEmail(payload);

  const { user, accessToken, refreshToken } = result;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: config.node_env === "development" ? false : true,
    sameSite: config.node_env === "development" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: {
      accessToken,
      refreshToken,
      user,
    },
  });
});

const isDev = config.node_env === "development";
const cookieOptions = {
  httpOnly: true,
  secure: !isDev,
  sameSite: isDev ? ("lax" as const) : ("none" as const),
  path: "/", // set explicitly so set and clear always match
};

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authService.loginUser(payload);
  const { accessToken, refreshToken } = result;

  // res.cookie("accessToken", accessToken, {
  //   httpOnly: true,
  //   secure: config.node_env === "development" ? false : true,
  //   sameSite: config.node_env === "development" ? "lax" : "none",
  //   maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
  // });

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
  });
  // res.cookie("refreshToken", refreshToken, {
  //   httpOnly: true,
  //   secure: config.node_env === "development" ? false : true,
  //   sameSite: config.node_env === "development" ? "lax" : "none",
  //   maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  // });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      accessToken,
      refreshToken,
    },
  });
});

const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const { accessToken, refreshToken } = await authService.googleLogin(payload);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: config.node_env === "development" ? false : true,
    sameSite: config.node_env === "development" ? "lax" : "none",
    maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.node_env === "development" ? false : true,
    sameSite: config.node_env === "development" ? "lax" : "none",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New tokens generated successfully",
    data: {
      accessToken,
      refreshToken,
    },
  });
});

const logOut = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User log out successfully",
    data: null,
  });
});

export const authController = {
  registerUser,
  verifyUserEmail,
  loginUser,
  googleLogin,
  logOut,
};
