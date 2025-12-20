# API Handling & Mocking Strategy

## Overview
Commerce-Lab does not use a real backend. Instead, it uses a **Mock API Client** that simulates network requests, latency, and database operations using an in-memory JSON object.

## Architecture

### 1. Mock Database (`src/api-mocks/db.json`)
- A JSON file acting as the initial state of the database.
- Contains `users`, `products`, `cart`, `orders`.

### 2. API Client (`src/lib/api-client.ts`)
- A class `MockApiClient` that mimics `axios` or `fetch`.
- **Methods**: `get`, `getById`, `post`, `updateCartItem`, etc.
- **Latency**: Artificial delay (`setTimeout`) is added to every request to simulate real-world network conditions (Loading states).
- **State**: In-memory state. *Note: Changes are lost on refresh unless explicitly saved to localStorage (implemented for some features).*

### 3. Data Fetching (React Query)
- We use `@tanstack/react-query` for all data fetching.
- **Queries**: `useQuery` for fetching data (Products, Cart).
- **Mutations**: `useMutation` for modifying data (AddToCart, Checkout).
- **Optimistic Updates**: Implemented in Cart to show immediate UI feedback.

## Example Usage
```typescript
// Fetching Products
const { data } = useQuery({
  queryKey: ["products"],
  queryFn: () => apiClient.getProducts(),
});

// Adding to Cart
const mutation = useMutation({
  mutationFn: (item) => apiClient.post("cart", item),
  onSuccess: () => queryClient.invalidateQueries(["cart"]),
});
```
