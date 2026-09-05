import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (
  payload: JwtPayload,
  secret: string,
  expireIn: SignOptions,
) => {
  const token = jwt.sign(payload, secret, {
    expiresIn: expireIn,
  } as SignOptions);

  return token;
};

const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return {
      success: true,
      data: verifiedToken,
    };
  } catch (error: any) {
    console.log("Token verification failed:", error);
    return {
      success: false,
      data: error.message,
    };
  }
};

export const jwtUtils = {
  createToken,
  verifyToken,
};
