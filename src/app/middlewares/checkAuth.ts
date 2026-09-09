import { Role } from "../../generated/prisma/enums";

export interface ReqUser {
  email: string;
  name: string;
  userId: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: ReqUser;
    }
  }
}
