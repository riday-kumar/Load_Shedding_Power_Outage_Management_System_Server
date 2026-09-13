import { prisma } from "../../lib/prisma";
import { AppError } from "../../utility/AppError";
import httpStatus from "http-status";
import { cloudinary } from "../../lib/cloudinary";
import { UploadApiResponse } from "cloudinary";

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
export const profileService = {
  uploadProfileImage,
};
