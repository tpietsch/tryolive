/**
 * API Type Definitions
 * Generated from OpenAPI schema
 */

// User model
export interface User {
  id?: number | null;
  email: string;
  username: string;
  full_name?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Breed model (inferred from /breeds endpoint)
export interface Breed {
  breed?: string;
  image?: string;
}

// Pagination response for breeds
export interface BreedsResponse {
  items: Breed[];
}

// Validation error
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

// HTTP validation error
export interface HTTPValidationError {
  detail?: ValidationError[];
}

// Health check response
export interface HealthResponse {
  status: string;
}

// Root endpoint response
export interface RootResponse {
  message: string;
}

// Delete response
export interface DeleteResponse {
  message: string;
}

// API Error response
export interface APIError {
  detail?: string | ValidationError[];
  message?: string;
}

// Query parameters for breeds endpoint
export interface BreedsQueryParams {
  page?: number;
  page_size?: number;
  accurate_entries?: boolean;
}
