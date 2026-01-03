import axios from "axios";
import type {
  AuthResponse,
  ApiResponse,
  Contact,
  ContactsResponse,
  CreateContactData,
  UpdateContactData,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(
          `${API_BASE_URL}/users/refresh-token`,
          {
            refreshToken,
          }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      "/users/register",
      credentials
    );
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/users/login", credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/users/logout");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>(
      "/users/profile"
    );
    return response.data;
  },
};

// Contacts API
export const contactsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    favorite?: boolean;
  }): Promise<ApiResponse<ContactsResponse>> => {
    const response = await api.get<ApiResponse<ContactsResponse>>("/contacts", {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ contact: Contact }>> => {
    const response = await api.get<ApiResponse<{ contact: Contact }>>(
      `/contacts/${id}`
    );
    return response.data;
  },

  create: async (
    data: CreateContactData
  ): Promise<ApiResponse<{ contact: Contact }>> => {
    const response = await api.post<ApiResponse<{ contact: Contact }>>(
      "/contacts",
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateContactData
  ): Promise<ApiResponse<{ contact: Contact }>> => {
    const response = await api.put<ApiResponse<{ contact: Contact }>>(
      `/contacts/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/contacts/${id}`);
    return response.data;
  },

  toggleFavorite: async (
    id: string
  ): Promise<ApiResponse<{ contact: Contact }>> => {
    const response = await api.patch<ApiResponse<{ contact: Contact }>>(
      `/contacts/${id}/favorite`
    );
    return response.data;
  },
};

export default api;
