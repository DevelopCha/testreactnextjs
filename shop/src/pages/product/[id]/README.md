# Product Detail Page Implementation

## 🎯 Learning Objectives
- **Dynamic Routing**: Accessing the URL parameter `id` using `useRouter`.
- **Derived State**: Using `useMemo` to calculate the total price based on selected options and quantity.
- **Interactive UI**: Handling option selection and quantity updates.

## 🛠️ Implementation Logic
1. **Routing**: `src/pages/product/[id]/index.tsx` maps to `/product/1`, `/product/2`, etc.
2. **Data Fetching**: Fetches product details using the ID.
3. **Price Calculation**: `useMemo` re-calculates price whenever `selectedOption` or `quantity` changes.
4. **Cart Logic**: Checks authentication before adding to cart (simulated).

## 💡 Tips
- `useMemo` is crucial here to prevent unnecessary recalculations on every render, although simple math is cheap, it's a good pattern for more complex logic.
- Always validate inputs (like selected options) before submitting.
