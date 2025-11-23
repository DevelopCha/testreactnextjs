# Category Page Implementation

## 🎯 Learning Objectives
- **URL State Management**: Storing filter/sort state in the URL (`?sort=price_asc`) so it's shareable and persistent on refresh.
- **Client-side Filtering**: Filtering and sorting data using `useMemo` based on URL parameters.
- **Shallow Routing**: Using `router.push` to update the URL without a full page reload (Next.js handles this optimized transition).

## 🛠️ Implementation Logic
1. **Params**: Extracts `slug` and `sort` from `router.query`.
2. **Filtering**: Filters the full product list by category matching the slug.
3. **Sorting**: Sorts the filtered list based on the `sort` parameter.
4. **Interaction**: Changing the select box updates the URL query parameter.

## 💡 Tips
- For large datasets, filtering/sorting should happen on the server. For small datasets (like this mock), client-side is faster and provides immediate feedback.
- Always handle the "No results" case.
