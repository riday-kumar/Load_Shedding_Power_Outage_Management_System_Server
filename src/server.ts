import app from "./app";
import config from "./app/config";
import { transporter } from "./app/lib/nodemailer";
import { prisma } from "./app/lib/prisma";
import { redisClient } from "./app/lib/redis";

const main = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");

    // redis database connect
    await redisClient.connect();
    console.log("redis connected successfully");

    await transporter.verify();
    console.log("Nodemailer connected successfully");

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

main();
