import apiClient from './client';
import { ApiResponse, AuthResponseData } from '../types/auth';

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const registerApi = async (payload: RegisterPayload): Promise<ApiResponse<AuthResponseData>> => {
  const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
  return response.data;
};

export const loginApi = async (payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> => {
  const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
  return response.data;
};

export const logoutApi = async (): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>('/auth/logout');
  return response.data;
};

export const getMeApi = async (): Promise<ApiResponse<{ user: AuthResponseData['user'] }>> => {
  const response = await apiClient.get<ApiResponse<{ user: AuthResponseData['user'] }>>('/auth/me');
  return response.data;
};

export const refreshTokenApi = async (): Promise<ApiResponse<AuthResponseData>> => {
  const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/refresh');
  return response.data;
};

