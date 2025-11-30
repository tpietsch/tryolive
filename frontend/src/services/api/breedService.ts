import { AxiosResponse } from "axios";
import apiClient from "./client";
import { BreedsQueryParams, BreedsResponse } from "../../types/api";

/**
 * Breed Service
 * Handles all breed-related API operations
 */
class BreedService {
  private readonly basePath = "/api/breeds";

  /**
   * Get paginated list of breeds
   * @param params Query parameters for pagination
   */
  async getBreeds(params?: BreedsQueryParams): Promise<BreedsResponse> {
    const response: AxiosResponse<BreedsResponse> = await apiClient.get(
      this.basePath,
      {
        params: {
          page: params?.page || 1,
          page_size: params?.page_size || 10,
        },
      }
    );
    return response.data;
  }

  /**
   * Get breeds with default pagination (first page, 10 items)
   */
  async getAll(): Promise<BreedsResponse> {
    return this.getBreeds({ page: 1, page_size: 10 });
  }

  /**
   * Get specific page of breeds
   * @param page Page number
   * @param pageSize Number of items per page
   */
  async getPage(page: number, pageSize: number = 10): Promise<BreedsResponse> {
    return this.getBreeds({ page, page_size: pageSize });
  }
}

// Export singleton instance
export const breedService = new BreedService();
export default breedService;
