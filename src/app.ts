import express, { Application, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import { sendResponse } from "./app/utility/sendResponse";
import httpStatus from "http-status";
import config from "./app/config";
import { AuthRoutes } from "./app/module/auth/auth.route";
import { AdminRoutes } from "./app/module/admin/admin.route";
import { PowerAuthRoutes } from "./app/module/power-auth/power-auth.route";

const app: Application = express();

app.use(
  cors({
    origin: config.frontend_url,
    credentials: true,
  }),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/power-auth", PowerAuthRoutes);

// basic route
app.get("/", (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: config.welcome_msg,
    data: null,
  });
});

// Register the error handler middleware
app.use(errorHandler);
// Register Not Found handler middleware
app.use(notFound);

export default app;
