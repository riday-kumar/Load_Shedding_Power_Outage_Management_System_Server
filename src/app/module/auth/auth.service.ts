import config from "../../config";
import { googleClient } from "../../lib/googleAuth";
import { TokenPayload } from "google-auth-library";
import { AppError } from "../../utility/AppError";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import {
  AuthProvider,
  Role,
  UserStatus,
} from "../../../generated/prisma/enums";
import path from "path";
import ejs from "ejs";
import { transporter } from "../../lib/nodemailer";
import { jwtUtils } from "../../utility/jwt";
import { SignOptions } from "jsonwebtoken";

interface IGoogleLoginPayload {
  idToken: string;
}

const googleLogin = async (payload: IGoogleLoginPayload) => {
  let googleIdTokenPayload: TokenPayload | null | undefined = null;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: payload.idToken,
      audience: config.client_id,
    });
    googleIdTokenPayload = ticket.getPayload();
  } catch (error) {
    console.log("Google ID Token Verification Failed", error);
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Google ID Token Verification Failed",
    );
  }

  if (!googleIdTokenPayload) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid or expired Google ID Token",
    );
  }

  if (!googleIdTokenPayload.email) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Google ID Token does not contain email",
    );
  }

  if (!googleIdTokenPayload.name) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Google ID Token does not contain name",
    );
  }

  // check user is exists in database or not
  const isCustomerExistWithGoogleAuth = await prisma.user.findUnique({
    where: {
      email: googleIdTokenPayload.email,
      role: Role.CUSTOMER,
      googleId: googleIdTokenPayload.sub,
    },
  });

  let user = isCustomerExistWithGoogleAuth;

  if (!isCustomerExistWithGoogleAuth) {
    const isCustomerExistWithCredentials = await prisma.user.findUnique({
      where: {
        email: googleIdTokenPayload.email,
        role: Role.CUSTOMER,
        authProvider: AuthProvider.CREDENTIAL,
      },
    });

    if (isCustomerExistWithCredentials) {
      if (!isCustomerExistWithCredentials.emailVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, "Email not verified");
      }

      if (isCustomerExistWithCredentials.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
      }

      if (isCustomerExistWithCredentials.status === UserStatus.BLOCK) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is blocked");
      }

      user = await prisma.user.update({
        where: {
          id: isCustomerExistWithCredentials.id,
        },
        data: {
          googleId: googleIdTokenPayload.sub,
        },
      });
    } else {
      //google register
      user = await prisma.user.create({
        data: {
          email: googleIdTokenPayload.email,
          name: googleIdTokenPayload.name,
          authProvider: AuthProvider.GOOGLE,
          googleId: googleIdTokenPayload.sub,
          emailVerified: true,
        },
      });

      // send email for 1st time login
      const welcomeTemplatePath = path.join(
        process.cwd(),
        "src/app/templates/customer-welcome-email.ejs",
      );

      const html = await ejs.renderFile(welcomeTemplatePath, {
        name: user?.email,
        appName: "Load Shedding Power Outage Management System",
        loginUrl: `${config.frontend_url}/login`,
        year: new Date().getFullYear(),
      });

      const mailOptions = {
        from: config.email_sender,
        to: user.email,
        subject: "Welcome to Load Shedding Power Outage Management System",
        html,
      };
      await transporter.sendMail(mailOptions);
    }
  }

  const jwtPayload = {
    userId: user?.id,
    name: user?.name,
    email: user?.email,
    role: user?.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_token_expire as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_token_expire as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const authService = {
  googleLogin,
};
