// backend/src/common/ValidRoutes.ts
export const ValidRoutes = {
  HOME:        "/",
  LOGIN:       "/login",
  UPLOAD:      "/upload",
  IMAGES_LIST: "/images",      // gallery overview
  IMAGES:      "/images/:id",  // detail page for a single image
} as const;
