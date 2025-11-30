import { AxiosResponse } from "axios";
import apiClient from "./client";
import { HealthResponse, RootResponse } from "../../types/api";

/**
 * Health Service
 * Handles health check and root endpoint operations
 */
class HealthService {
  /**
   * Get root endpoint message
   */
  async getRoot(): Promise<RootResponse> {
    const response: AxiosResponse<RootResponse> = await apiClient.get("/");
    return response.data;
  }

  /**
   * Health check endpoint
   */
  async checkHealth(): Promise<HealthResponse> {
    const response: AxiosResponse<HealthResponse> = await apiClient.get("/health");
    return response.data;
  }

  /**
   * Check if API is available
   * Returns true if health check succeeds, false otherwise
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.checkHealth();
      return response.status === "healthy";
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const healthService = new HealthService();
export default healthService;
