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
import { IGoogleLoginPayload } from "./auth.interface";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { redisClient } from "../../lib/redis";

interface IRegisterUserPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

interface IVerifyEmailPayload {
  email: string;
  otp: string;
}

interface ILoginUserPayload {
  email: string;
  password: string;
}

const registerUser = async (payload: IRegisterUserPayload) => {
  const { name, address, password, phone } = payload;
  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "A user with this email address already exists.",
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_round),
  );

  // otp for registration
  const otp = crypto.randomInt(100000, 999999).toString();
  const registerOtpKey = `userRegistrationOtp : ${email}`;
  await redisClient.setEx(registerOtpKey, 300, otp);

  // we will store users initial Data into the redis
  const redisUserDataPayload = {
    name,
    email,
    phone,
    address,
    password: hashedPassword,
  };

  const patientRegistrationKey = `userRegistrationData : ${email}`;
  await redisClient.setEx(
    patientRegistrationKey,
    300,
    JSON.stringify(redisUserDataPayload),
  );

  // now we have to send otp Email to the USER
  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/register-otp.ejs",
  );

  const templateData = {
    name: name,
    email,
    otp: otp,
    expirationMinutes: "5",
  };
  const html = await ejs.renderFile(templatePath, templateData);

  const mailOptions = {
    from: config.email_sender,
    to: payload.email,
    subject: "Verify Your Account",
    html,
  };

  transporter.sendMail(mailOptions);
  return null;
};

const verifyUserEmail = async (payload: IVerifyEmailPayload) => {
  const otp = payload.otp;
  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists?.emailVerified) {
    throw new AppError(httpStatus.CONFLICT, "Email already Exists");
  }

  if (isUserExists?.status === UserStatus.BLOCK) {
    throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
  }

  if (isUserExists?.isDeleted || isUserExists?.status === UserStatus.DELETED) {
    throw new AppError(httpStatus.FORBIDDEN, "User is deleted");
  }

  const otpKey = `userRegistrationOtp : ${email}`;

  const storedOtp = await redisClient.get(otpKey);
  console.log("get otp", storedOtp);

  if (!storedOtp) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP!");
  }

  const valid = storedOtp === otp;
  if (!valid) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP Doesn't Match");
  }

  await redisClient.del(otpKey);

  const userRegistrationKey = `userRegistrationData : ${email}`;
  const storedRegisterData = await redisClient.get(userRegistrationKey);

  if (!storedRegisterData) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Data Doesn't exists!");
  }

  const userPayload: IRegisterUserPayload = JSON.parse(storedRegisterData);

  const createdUser = await prisma.user.create({
    data: {
      name: userPayload.name,
      email: userPayload.email,
      password: userPayload.password,
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phone: userPayload.phone,
      address: userPayload.address,
    },
    omit: { password: true },
  });

  // now delete registration data from the redis
  const registerDataKey = `userRegistrationData : ${email}`;
  await redisClient.del(registerDataKey);

  // send welcome email to the patients
  const welcomeTemplatePath = path.join(
    process.cwd(),
    "/src/app/templates/customer-welcome-email.ejs",
  );

  const html = await ejs.renderFile(welcomeTemplatePath, {
    name: payload.email,
    appName: "Load Shedding Power Outage Management System",
    // loginUrl: "youtube.com",
    year: new Date().getFullYear(),
  });

  const mailOptions = {
    from: config.email_sender,
    to: payload.email,
    subject: "Welcome to Load Shedding Power Outage Management System",
    html,
  };

  transporter.sendMail(mailOptions);

  const { ...user } = createdUser;
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
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
    user,
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: ILoginUserPayload) => {
  const { password } = payload;
  const email = payload.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (user.status === UserStatus.BLOCK) {
    throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
  }

  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new AppError(httpStatus.FORBIDDEN, "User is deleted");
  }

  if (user.password === null && user.googleId !== null) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "User Already Has account registered with google. Try to login with google",
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password as string,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, "Invalid credentials");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
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
  registerUser,
  verifyUserEmail,
  loginUser,
  googleLogin,
};
