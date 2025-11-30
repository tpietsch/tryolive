import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { APIError } from "../../types/api";

/**
 * Base API client configuration
 */
class APIClient {
  private static instance: AxiosInstance;

  static getInstance(): AxiosInstance {
    if (!APIClient.instance) {
      APIClient.instance = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost",
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Request interceptor
      APIClient.instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
          // Add authentication token if available
          const token = localStorage.getItem("auth_token");
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Response interceptor
      APIClient.instance.interceptors.response.use(
        (response) => response,
        (error: AxiosError<APIError>) => {
          // Handle common errors
          if (error.response) {
            const { status, data } = error.response;

            switch (status) {
              case 401:
                // Unauthorized - clear auth and redirect to login
                localStorage.removeItem("auth_token");
                window.location.href = "/auth/sign-in";
                break;
              case 403:
                console.error("Forbidden:", data);
                break;
              case 404:
                console.error("Not found:", data);
                break;
              case 422:
                console.error("Validation error:", data);
                break;
              case 500:
                console.error("Server error:", data);
                break;
              default:
                console.error("API error:", data);
            }
          } else if (error.request) {
            console.error("Network error:", error.message);
          }

          return Promise.reject(error);
        }
      );
    }

    return APIClient.instance;
  }
}

export const apiClient = APIClient.getInstance();
export default apiClient;
