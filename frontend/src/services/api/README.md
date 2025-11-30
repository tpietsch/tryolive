# API Services

This directory contains all API service modules for interacting with the Olive API backend.

## Structure

```
services/api/
├── client.ts          # Axios client configuration with interceptors
├── userService.ts     # User CRUD operations
├── breedService.ts    # Breed operations with pagination
├── healthService.ts   # Health check and root endpoint
├── index.ts           # Central export point
└── README.md          # This file
```

## Configuration

Set the API base URL in your `.env` file:

```env
VITE_API_BASE_URL=http://localhost
```

If not set, defaults to `http://localhost`.

## Usage Examples

### Importing Services

```typescript
// Import individual services
import { userService, breedService, healthService } from "@/services/api";

// Import types
import { User, Breed, BreedsResponse } from "@/services/api";

// Import API client directly
import { apiClient } from "@/services/api";
```

### User Service

```typescript
import { userService } from "@/services/api";

// Get all users
const users = await userService.getAll();

// Get user by ID
const user = await userService.getById(1);

// Create a new user
const newUser = await userService.create({
  email: "john@example.com",
  username: "johndoe",
  full_name: "John Doe",
  is_active: true,
});

// Update a user
const updatedUser = await userService.update(1, {
  full_name: "John Smith",
});

// Delete a user
const response = await userService.delete(1);

// Get current user
const currentUser = await userService.getCurrentUser();
```

### Breed Service

```typescript
import { breedService } from "@/services/api";

// Get all breeds (default pagination)
const breedsResponse = await breedService.getAll();

// Get breeds with custom pagination
const breeds = await breedService.getBreeds({
  page: 2,
  page_size: 20,
});

// Get specific page
const pageBreeds = await breedService.getPage(3, 15);

// Access response data
console.log(breeds.items);      // Array of breeds
console.log(breeds.total);      // Total count
console.log(breeds.page);       // Current page
console.log(breeds.page_size);  // Items per page
console.log(breeds.total_pages); // Total pages
```

### Health Service

```typescript
import { healthService } from "@/services/api";

// Get root message
const root = await healthService.getRoot();
console.log(root.message); // "Welcome to Olive API"

// Check health
const health = await healthService.checkHealth();
console.log(health.status); // "healthy"

// Check if API is healthy (returns boolean)
const isHealthy = await healthService.isHealthy();
```

## React Component Examples

### Using in a React Component with useState/useEffect

```typescript
import { useState, useEffect } from "react";
import { breedService, Breed, BreedsResponse } from "@/services/api";

function DogBreedsComponent() {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchBreeds() {
      try {
        setLoading(true);
        const response = await breedService.getPage(page, 10);
        setBreeds(response.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch breeds");
      } finally {
        setLoading(false);
      }
    }

    fetchBreeds();
  }, [page]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {breeds.map((breed) => (
        <div key={breed.id}>{breed.name}</div>
      ))}
    </div>
  );
}
```

### Using with React Query (recommended)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, User } from "@/services/api";

// Fetch users
function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  });
}

// Create user
function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: Omit<User, "id" | "created_at" | "updated_at">) =>
      userService.create(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Usage in component
function UsersComponent() {
  const { data: users, isLoading, error } = useUsers();
  const createUser = useCreateUser();

  const handleCreate = async () => {
    await createUser.mutateAsync({
      email: "test@example.com",
      username: "testuser",
    });
  };

  // ... rest of component
}
```

## Error Handling

The API client includes automatic error handling:

- **401 Unauthorized**: Automatically clears auth token and redirects to login
- **403 Forbidden**: Logs error to console
- **404 Not Found**: Logs error to console
- **422 Validation Error**: Logs validation details to console
- **500 Server Error**: Logs error to console

### Custom Error Handling

```typescript
import { userService } from "@/services/api";
import { AxiosError } from "axios";
import { APIError } from "@/services/api";

try {
  const user = await userService.getById(999);
} catch (error) {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as APIError;
    console.error("API Error:", apiError.detail);
  }
}
```

## Authentication

The API client automatically adds authentication tokens from localStorage:

```typescript
// Set auth token (after login)
localStorage.setItem("auth_token", "your-jwt-token");

// All subsequent requests will include:
// Authorization: Bearer your-jwt-token

// Clear auth token (on logout)
localStorage.removeItem("auth_token");
```

## TypeScript Types

All services are fully typed. Key types include:

- `User` - User model
- `Breed` - Breed model
- `BreedsResponse` - Paginated breeds response
- `BreedsQueryParams` - Query parameters for breeds endpoint
- `HealthResponse` - Health check response
- `RootResponse` - Root endpoint response
- `DeleteResponse` - Delete operation response
- `ValidationError` - Validation error details
- `HTTPValidationError` - HTTP validation error
- `APIError` - Generic API error

## Adding New Services

To add a new service:

1. Create a new service file (e.g., `productService.ts`)
2. Define the service class with methods
3. Export a singleton instance
4. Add exports to `index.ts`

Example:

```typescript
// productService.ts
import { AxiosResponse } from "axios";
import apiClient from "./client";

interface Product {
  id: number;
  name: string;
}

class ProductService {
  private readonly basePath = "/products";

  async getAll(): Promise<Product[]> {
    const response: AxiosResponse<Product[]> = await apiClient.get(this.basePath);
    return response.data;
  }
}

export const productService = new ProductService();
export default productService;
```

Then add to `index.ts`:

```typescript
export { default as productService } from "./productService";
```
