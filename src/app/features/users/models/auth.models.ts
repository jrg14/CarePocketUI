export type AuthMode = 'login' | 'register';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  fullName: string;
}

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  isActive: boolean;
  isSuperuser: boolean;
  isVerified: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
}

export interface ApiUserResponse {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}
