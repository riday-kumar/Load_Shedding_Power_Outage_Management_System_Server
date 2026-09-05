import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  node_env: process.env.NODE_ENV!,
  welcome_msg: process.env.WELCOME_MSG!,

  database_url: process.env.DATABASE_URL!,

  port: process.env.PORT!,
  frontend_url: process.env.FRONTEND_URL!,

  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_token_expire: process.env.JWT_ACCESS_EXPIRES_IN!,
  jwt_refresh_token_expire: process.env.JWT_REFRESH_EXPIRES_IN!,
};

export default config;
