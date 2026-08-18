// src/types/authTypes.ts
export interface User {
  id: string;
  email: string;
  is_verified: boolean;
  email_app_password?: string | null;
  linkedin_li_at?: string | null;
  groq_api_token?: string | null;
  sender_name?: string | null;
}

export interface TokenPayload {
  user: User;
  iat: number;
  exp: number;
  is_verified: boolean;
  email_app_password?: string | null;
  linkedin_li_at?: string | null;
  groq_api_token?: string | null;
  sender_name?: string | null;
}

export interface CredentialsFormData {
  email_app_password: string;
  linkedin_li_at: string;
  groq_api_token: string;
  sender_name: string;
}

// types/auth.ts

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  message: string;
}

export interface RegisterInput extends LoginInput {
  first_name: string;
  last_name: string;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface ResendOtpInput {
  email: string;
}

export interface UpdateUserInput {
  phone?: string;
  gender?: string;
  email_app_password?: string;
  linkedin_li_at?: string;
  groq_api_token?: string;
  sender_name?: string;
}

export interface UserDetails {
  id?: number;
  phone?: string;
  gender?: string;
  email_app_password?: string;
  linkedin_li_at?: string;
  groq_api_token?: string;
  sender_name?: string;
}
