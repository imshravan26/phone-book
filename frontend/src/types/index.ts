export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  address?: Address;
  notes?: string;
  tags?: string[];
  isFavorite: boolean;
  owner: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  address?: Address;
  notes?: string;
  tags?: string[];
}

export interface UpdateContactData extends Partial<CreateContactData> {}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ContactsResponse {
  contacts: Contact[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
}
