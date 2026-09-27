import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { AppError } from "./AppError";
import httpStatus from "http-status";
import bcrypt from "bcrypt";

// tester admin
export const seedAdmin = async () => {
  try {
    const isAdminExist = await prisma.user.findFirst({
      where: {
        role: Role.ADMIN,
      },
    });
    if (isAdminExist) {
      console.log("Admin already exist");
      return;
    }

    const name = config.admin_name;
    const email = config.admin_email;
    const password = config.admin_password;

    if (!name || !email || !password) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Super Admin Name , Email, Password Missing In Env File!!!",
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_round),
    );

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.ADMIN,
        emailVerified: true,
      },
    });
    console.log("Admin created");
  } catch (error) {
    console.log("Admin creation failed", error);
    await prisma.user.delete({
      where: {
        email: config.admin_email,
      },
    });
  }
};

// tester power authority
export const seedPowerAuthority = async () => {
  try {
    const isPowerAuthorityExist = await prisma.user.findFirst({
      where: {
        role: Role.POWER_AUTH,
      },
    });
    if (isPowerAuthorityExist) {
      console.log("Power Authority already exist");
      return;
    }

    const name = config.power_authority_name;
    const email = config.power_authority_email;
    const password = config.power_authority_password;

    if (!name || !email || !password) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Power Authority Name , Email, Password Missing In Env File!!!",
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_round),
    );

    const powerAuthority = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.POWER_AUTH,
        emailVerified: true,
      },
    });
    console.log("Power Authority created");
  } catch (error) {
    console.log("Power Authority creation failed", error);
    await prisma.user.delete({
      where: {
        email: config.power_authority_email,
      },
    });
  }
};

// seed distributor manager
export const seedDistributorManager = async () => {
  try {
    const isDistributorManagerExist = await prisma.user.findFirst({
      where: {
        role: Role.DISTRIBUTOR_MANAGER,
      },
    });
    if (isDistributorManagerExist) {
      console.log("Distributor Manager already exist");
      return;
    }

    const name = config.distributor_manager_name;
    const email = config.distributor_manager_email;
    const password = config.distributor_manager_password;
    const distributor_id = config.distributor_id;

    if (!name || !email || !password) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Distributor Manager Name , Email, Password Missing In Env File!!!",
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_round),
    );

    const distributorManager = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.DISTRIBUTOR_MANAGER,
        distributorManager: {
          create: {
            distributor_id,
          },
        },
        emailVerified: true,
      },
    });
    console.log("Distributor Manager created");
  } catch (error) {
    console.log("Distributor Manager creation failed", error);
    await prisma.user.delete({
      where: {
        email: config.distributor_manager_email,
      },
    });
  }
};

// seed power operator
// export const seedPowerOperator = async () => {
//   try {
//     const isPowerOperatorExist = await prisma.user.findFirst({
//       where: {
//         role: Role.POWER_OPERATOR,
//       },
//     });
//     if (isPowerOperatorExist) {
//       console.log("Power Operator already exist");
//       return;
//     }

//     const name = config.power_operator_name;
//     const email = config.power_operator_email;
//     const password = config.power_operator_password;

//     if (!name || !email || !password) {
//       throw new AppError(
//         httpStatus.INTERNAL_SERVER_ERROR,
//         "Power Operator Name , Email, Password Missing In Env File!!!",
//       );
//     }

//     const hashedPassword = await bcrypt.hash(
//       password,
//       Number(config.bcrypt_salt_round),
//     );

//     const powerOperator = await prisma.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         role: Role.POWER_OPERATOR,
//         emailVerified: true,
//          powerOperators: {
//             create: {
//             createdById: userId,
//             substation_id,
//             },
//       },
//       },
//     });
//     console.log("Power Operator created");
//   } catch (error) {
//     console.log("Power Operator creation failed", error);
//     await prisma.user.delete({
//       where: {
//         email: config.power_operator_email,
//       },
//     });
//   }
// };

// seed technician
// export const seedTechnician = async () => {
//   try {
//     const isTechnicianExist = await prisma.user.findFirst({
//       where: {
//         role: Role.TECHNICIAN,
//       },
//     });
//     if (isTechnicianExist) {
//       console.log("Technician already exist");
//       return;
//     }

//     const name = config.technician_name;
//     const email = config.technician_email;
//     const password = config.technician_password;

//     if (!name || !email || !password) {
//       throw new AppError(
//         httpStatus.INTERNAL_SERVER_ERROR,
//         "Technician Name , Email, Password Missing In Env File!!!",
//       );
//     }

//     const hashedPassword = await bcrypt.hash(
//       password,
//       Number(config.bcrypt_salt_round),
//     );

//     const technician = await prisma.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         role: Role.TECHNICIAN,
//         emailVerified: true,
//       },
//     });
//     console.log("Technician created");
//   } catch (error) {
//     console.log("Technician creation failed", error);
//     await prisma.user.delete({
//       where: {
//         email: config.technician_email,
//       },
//     });
//   }
// };
