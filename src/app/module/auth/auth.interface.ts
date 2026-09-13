export interface IGoogleLoginPayload {
  idToken: string;
}

export interface IRegisterUserPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

export interface IVerifyEmailPayload {
  email: string;
  otp: string;
}

export interface ILoginUserPayload {
  email: string;
  password: string;
}
