# Event Detail Page (SSG)

## 🎯 Learning Objectives
- **Static Site Generation (SSG)**: Pre-rendering pages at build time using `getStaticProps` and `getStaticPaths`.
- **Incremental Static Regeneration (ISR)**: Using `revalidate` to update static pages periodically without a full rebuild.
- **Fallback Handling**: Handling the `router.isFallback` state for paths that weren't generated at build time.

## 🛠️ Implementation Logic
1. **getStaticPaths**: Returns a list of IDs to pre-render.
2. **getStaticProps**: Fetches data for a specific ID at build time.
3. **ISR**: `revalidate: 60` ensures that if data changes, the page is updated in the background after 60 seconds.

## 💡 Tips
- SSG is the fastest rendering method because HTML is served from CDN.
- Use SSG for marketing pages, blog posts, and documentation where data doesn't change per-user.
