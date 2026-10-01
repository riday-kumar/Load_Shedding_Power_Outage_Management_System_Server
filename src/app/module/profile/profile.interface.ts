export interface IUserUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
  feederId?: string;
}

export interface IResetPasswordPayload {
  currentPassword: string;
  newPassword: string;
}
