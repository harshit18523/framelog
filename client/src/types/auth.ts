export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
  // Computed fields for UI compatibility
  handle: string;
  initials: string;
  tone: string;
}

export interface AuthResponseData {
  user: {
    _id?: string;
    id?: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    location?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  accessToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
