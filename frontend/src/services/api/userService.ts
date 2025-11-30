import { AxiosResponse } from "axios";
import apiClient from "./client";
import { User, DeleteResponse } from "../../types/api";

/**
 * User Service
 * Handles all user-related API operations
 */
class UserService {
  private readonly basePath = "/users";

  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await apiClient.get(this.basePath);
    return response.data;
  }

  /**
   * Get a specific user by ID
   */
  async getById(userId: number): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.get(
      `${this.basePath}/${userId}`
    );
    return response.data;
  }

  /**
   * Create a new user
   */
  async create(user: Omit<User, "id" | "created_at" | "updated_at">): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.post(
      this.basePath,
      user
    );
    return response.data;
  }

  /**
   * Update an existing user
   */
  async update(
    userId: number,
    user: Partial<Omit<User, "id" | "created_at" | "updated_at">>
  ): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.put(
      `${this.basePath}/${userId}`,
      user
    );
    return response.data;
  }

  /**
   * Delete a user
   */
  async delete(userId: number): Promise<DeleteResponse> {
    const response: AxiosResponse<DeleteResponse> = await apiClient.delete(
      `${this.basePath}/${userId}`
    );
    return response.data;
  }

  /**
   * Get current user (from /api/me endpoint)
   */
  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.get("/api/me");
    return response.data;
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;
