// src/images/AllImages.tsx
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";
import { ImageGrid } from "./ImageGrid";

export interface AllImagesProps {
  images: IApiImageData[];
  isLoading: boolean;
  hasError: boolean;
  /** The JSX form (typically <ImageSearchForm … />) passed from App. */
  searchPanel?: React.ReactNode;
}

export function AllImages(props: AllImagesProps) {
  if (props.isLoading) return <p>Loading images…</p>;
  if (props.hasError) return <p style={{ color: "red" }}>Error loading images.</p>;

  return (
    <div>
      {/** First render the search panel, if any */}
      {props.searchPanel && <div style={{ marginBottom: "1em" }}>{props.searchPanel}</div>}

      {/** Then render the grid of images */}
      <ImageGrid images={props.images} />
    </div>
  );
}
