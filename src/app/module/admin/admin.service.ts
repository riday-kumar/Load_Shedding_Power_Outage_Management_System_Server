import config from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utility/AppError";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { Role } from "../../../generated/prisma/enums";

interface ICreatePowerAuth {
  name: string;
  password: string;
  email: string;
}

interface ICreateDistributorManager {
  name: string;
  email: string;
  password: string;
  distributor_id: string;
}

interface ICreateDistributor {
  company_name: string;
}

const createPowerAuthority = async (payload: ICreatePowerAuth) => {
  const { name, password } = payload;
  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({
    where: { email, role: Role.POWER_AUTH },
  });

  if (isUserExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "A power authority with this email address already exists.",
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
      emailVerified: true,
      role: Role.POWER_AUTH,
    },
    omit: {
      password: true,
    },
  });
  return powerAuthority;
};

const createDistributor = async (payload: ICreateDistributor) => {
  const { company_name } = payload;
  const isDistributorExists = await prisma.distributor.findFirst({
    where: {
      company_name,
    },
  });

  if (isDistributorExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "This distributor company name already exists.",
    );
  }

  const newDistributor = await prisma.distributor.create({
    data: {
      company_name,
    },
  });
  return newDistributor;
};

const createDistributorManager = async (payload: ICreateDistributorManager) => {
  const { name, password, distributor_id } = payload;
  const email = payload.email.trim().toLowerCase();

  const isManagerExists = await prisma.user.findUnique({
    where: { email, role: Role.DISTRIBUTOR_MANAGER },
  });

  if (isManagerExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "A distributor manager with this email address already exists.",
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
      emailVerified: true,
      role: Role.DISTRIBUTOR_MANAGER,
      distributorManager: {
        create: {
          distributor_id,
        },
      },
    },

    omit: {
      password: true,
    },
  });
  return distributorManager;
};

const allUsers = async (payload: string | null) => {
  const users = await prisma.user.findMany({
    where: {
      role: Role[payload as keyof typeof Role],
    },
    omit: {
      password: true,
    },
  });
  return users;
};

const allDistributors = async () => {
  const distributors = await prisma.distributor.findMany();
  return distributors;
};

const allDistributorManager = async () => {
  const distributorsManager = await prisma.user.findMany({
    where: {
      role: Role.DISTRIBUTOR_MANAGER,
    },
    omit: {
      password: true,
    },
    include: {
      distributorManager: {
        include: {
          distributor: true,
        },
      },
    },
  });
  return distributorsManager;
};

export const adminService = {
  createPowerAuthority,
  createDistributor,
  createDistributorManager,
  allUsers,
  allDistributors,
  allDistributorManager,
};
