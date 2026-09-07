import { OAuth2Client } from "google-auth-library";
import config from "../config";

export const googleClient = new OAuth2Client({
  clientId: config.client_id,
  clientSecret: config.client_secret,
  redirectUri: config.frontend_url,
});
