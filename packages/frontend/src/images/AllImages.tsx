// src/images/AllImages.tsx
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";
import { ImageGrid } from "./ImageGrid";

export interface AllImagesProps {
  images: IApiImageData[];
  isLoading: boolean;
  hasError: boolean;
  searchPanel?: React.ReactNode;
}

export function AllImages({
    images,
    isLoading,
    hasError,
    searchPanel
  }: AllImagesProps) {
    if (isLoading) return <p>Loading images…</p>;
    if (hasError)  return <p style={{color: "red"}}>Error loading images.</p>;
  
    return (
      <>
        {searchPanel}
        <ImageGrid images={images} />
      </>
    );
  }
