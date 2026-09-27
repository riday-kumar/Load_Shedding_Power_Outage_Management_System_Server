import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  node_env: process.env.NODE_ENV!,
  welcome_msg: process.env.WELCOME_MSG!,

  database_url: process.env.DATABASE_URL!,

  port: process.env.PORT!,
  frontend_url: process.env.FRONTEND_URL!,

  client_id: process.env.CLIENT_ID!,
  client_secret: process.env.CLIENT_SECRET!,

  smtp_pass: process.env.SMTP_PASS!,
  smtp_user: process.env.SMTP_USER!,
  smtp_service: process.env.SMTP_SERVICE!,
  email_sender: process.env.EMAIL_SENDER!,
  app_name: process.env.APP_NAME!,
  app_password: process.env.APP_PASSWORD!,

  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_token_expire: process.env.JWT_ACCESS_EXPIRES_IN!,
  jwt_refresh_token_expire: process.env.JWT_REFRESH_EXPIRES_IN!,

  bcrypt_salt_round: process.env.BCRYPT_SALT_ROUND!,

  redis_user: process.env.REDIS_USER!,
  redis_password: process.env.REDIS_PASSWORD!,
  redis_host: process.env.REDIS_HOST!,
  redis_port: process.env.REDIS_PORT!,
  otp_expiry: process.env.OTP_EXPIRY!,

  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY!,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET!,

  bkash_base_url: process.env.BKASH_BASE_URL!,
  bkash_username: process.env.BKASH_USERNAME!,
  bkash_password: process.env.BKASH_PASSWORD!,
  bkash_app_key: process.env.BKASH_APP_KEY!,
  bkash_app_secret: process.env.BKASH_APP_SECRET!,
  bkash_callback_url: process.env.BKASH_CALLBACK_URL!,

  admin_name: process.env.ADMIN_NAME!,
  admin_email: process.env.ADMIN_EMAIL!,
  admin_password: process.env.ADMIN_PASSWORD!,

  power_authority_name: process.env.POWER_AUTHORITY_NAME!,
  power_authority_email: process.env.POWER_AUTHORITY_EMAIL!,
  power_authority_password: process.env.POWER_AUTHORITY_PASSWORD!,

  distributor_manager_name: process.env.DISTRIBUTOR_MANAGER_NAME!,
  distributor_manager_email: process.env.DISTRIBUTOR_MANAGER_EMAIL!,
  distributor_manager_password: process.env.DISTRIBUTOR_MANAGER_PASSWORD!,
  distributor_id: process.env.DISTRIBUTOR_ID!,

  power_operator_name: process.env.POWER_OPERATOR_NAME!,
  power_operator_email: process.env.POWER_OPERATOR_EMAIL!,
  power_operator_password: process.env.POWER_OPERATOR_PASSWORD!,
  substation_id: process.env.SUBSTATION_ID!,

  technician_name: process.env.TECHNICIAN_NAME!,
  technician_email: process.env.TECHNICIAN_EMAIL!,
  technician_password: process.env.TECHNICIAN_PASSWORD!,
};

export default config;
