// Tipos para la autenticación

export type UserRole = 'CLIENT' | 'ADMIN';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone_number: string;
  role?: UserRole; // Opcional, default será CLIENT
}

export interface RegisterResponse {
  message: string;
  user_id?: string;
}

export interface Setup2FARequest {
  email: string;
  password: string;
}

export interface Setup2FAResponse {
  qr_uri: string;
  secret: string;
  manual_entry_key: string;
}

export interface Verify2FARequest {
  request: {
    email: string;
    password: string;
  };
  totp_request: {
    totp_code: string;
  };
}

export interface Verify2FAResponse {
  message: string;
  access_token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  totp_code: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    name?: string;
    phone_number?: string;
  };
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone_number: string;
  totp_verified: boolean;
  created_at: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone_number?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

export interface AdminUsersResponse {
  users: User[];
  total: number;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ErrorResponse {
  detail: string | ValidationError[];
}

// Tipos para Cifrado César

export interface CesarEncryptRequest {
  text: string;
  shift: number;
  save_to_history?: boolean;
}

export interface CesarDecryptRequest {
  text: string;
  shift: number;
  save_to_history?: boolean;
}

export interface CesarOperationResponse {
  operation: 'ENCRYPT' | 'DECRYPT';
  input_text: string;
  output_text: string;
  shift: number;
  saved_to_history: boolean;
}

export interface CesarHistoryItem {
  id: string;
  operation_type: 'ENCRYPT' | 'DECRYPT';
  input_text: string;
  output_text: string;
  shift: number;
  created_at: string;
}

export interface CesarHistoryResponse {
  total: number;
  items: CesarHistoryItem[];
  limit: number;
  offset: number;
}
