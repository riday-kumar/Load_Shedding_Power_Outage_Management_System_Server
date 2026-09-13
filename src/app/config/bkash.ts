import config from ".";
import { redisClient } from "../lib/redis";
import { AppError } from "../utility/AppError";
import httpStatus from "http-status";

// bkash grant token
export const grantToken = async () => {
  const bkashIdTokenKey = "bkash : bkashIdToken";
  const bkashRefreshTokenKey = "bkash : bkashRefreshToken";

  let bkashIdToken = await redisClient.get(bkashIdTokenKey);
  const bkashIdTokenTTL = await redisClient.ttl(bkashIdTokenKey);

  const bkashRefreshToken = await redisClient.get(bkashRefreshTokenKey);
  const bkashRefreshTokenTTL = await redisClient.ttl(bkashRefreshTokenKey);

  //   console.log({
  //     bkashIdToken,
  //     bkashIdTokenTTL,
  //     bkashRefreshToken,
  //     bkashRefreshTokenTTL,
  //   });

  if (
    (bkashIdTokenTTL <= 600 || !bkashIdToken) &&
    bkashRefreshToken &&
    bkashRefreshTokenTTL > 600
  ) {
    const refreshTokenResponse = await fetch(
      `${config.bkash_base_url}/tokenized/checkout/token/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: config.bkash_username,
          password: config.bkash_password,
        },
        body: JSON.stringify({
          app_key: config.bkash_app_key,
          app_secret: config.bkash_app_secret,
          refresh_token: bkashRefreshToken,
        }),
      },
    );

    if (!refreshTokenResponse.ok) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Bkash refreshTokenResponse Failed",
      );
    }

    const bkashRefreshTokenResult = await refreshTokenResponse.json();

    bkashIdToken = bkashRefreshTokenResult.id_token as string;

    await redisClient.setEx(bkashIdTokenKey, 60 * 60, bkashIdToken);

    return bkashIdToken;
  }

  if (bkashIdTokenTTL > 600) {
    return bkashIdToken;
  }

  const tokenResponse = await fetch(
    `${config.bkash_base_url}/tokenized/checkout/token/grant`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        username: config.bkash_username,
        password: config.bkash_password,
      },
      body: JSON.stringify({
        app_key: config.bkash_app_key,
        app_secret: config.bkash_app_secret,
      }),
    },
  );

  if (!tokenResponse.ok) {
    throw new Error("Bkash Access Token Grant Failed");
  }

  const tokenResult = await tokenResponse.json();
  bkashIdToken = tokenResult.id_token;
  //   console.log("result", tokenResult);

  // set id token(for 1h) and refresh token(for 28days) into the redis
  await redisClient.setEx(
    bkashRefreshTokenKey,
    60 * 60 * 24 * 28,
    tokenResult.refresh_token,
  );
  await redisClient.setEx(bkashIdTokenKey, 60 * 60, tokenResult.id_token);

  return bkashIdToken;
};
