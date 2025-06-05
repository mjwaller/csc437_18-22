// frontend/src/images/AllImages.tsx

import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";
import { ImageGrid } from "./ImageGrid";
import React from "react";

export interface AllImagesProps {
  images: IApiImageData[];
  isLoading: boolean;
  hasError: boolean;
  searchPanel?: React.ReactNode;
}

export function AllImages(props: AllImagesProps) {
  const { images, isLoading, hasError, searchPanel } = props;

  if (isLoading) {
    return <p>Loading images…</p>;
  }
  if (hasError) {
    return <p style={{ color: "red" }}>Error loading images.</p>;
  }

  return (
    <div>
      {searchPanel}

      <ImageGrid images={images} />
    </div>
  );
}
