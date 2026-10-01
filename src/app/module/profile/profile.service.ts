import { prisma } from "../../lib/prisma";
import { AppError } from "../../utility/AppError";
import httpStatus from "http-status";
import { cloudinary } from "../../lib/cloudinary";
import { UploadApiResponse } from "cloudinary";
import { IResetPasswordPayload, IUserUpdatePayload } from "./profile.interface";
import config from "../../config";
import bcrypt from "bcrypt";

const profile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
  });

  return user;
};

const uploadProfileImage = async (fileBuffer: Buffer, userId: string) => {
  const currentUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      imagePublicId: true,
      imageUrl: true,
    },
  });

  if (!currentUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const uploadResult = await new Promise<UploadApiResponse>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "images",
            resource_type: "auto",
          },
          async (error, result) => {
            if (error) {
              console.log(error);
              // throw new Error(error.message);
              return reject(error);
            }
            console.log("result", result);

            if (!result) {
              return reject(new Error("No result returned from cloudinary"));
            }
            resolve(result);
          },
        )
        .end(fileBuffer);
    },
  );

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      imageUrl: uploadResult?.secure_url,
      imagePublicId: uploadResult?.public_id,
    },
    omit: {
      password: true,
    },
  });

  if (currentUser?.imagePublicId && currentUser.imageUrl) {
    await cloudinary.uploader.destroy(currentUser.imagePublicId);
  }

  return updatedUser;
};

const profileUpdate = async (payload: IUserUpdatePayload, userId: string) => {
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: payload,
    omit: {
      password: true,
    },
  });

  return updatedUser;
};

const resetPassword = async (
  payload: IResetPasswordPayload,
  userId: string,
) => {
  const { currentPassword, newPassword } = payload;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  console.log("user", user);

  if (!user?.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Your account is not Credential Based",
    );
  }

  const comparePassword = await bcrypt.compare(currentPassword, user?.password);
  console.log("compare pass", comparePassword);

  if (!comparePassword) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Current Password Is Not Matched",
    );
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_round),
  );

  const updatePassword = await prisma.user.update({
    where: {
      id: user?.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return null;
};

export const profileService = {
  profile,
  uploadProfileImage,
  profileUpdate,
  resetPassword,
};
