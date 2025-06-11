// src/images/AllImages.tsx
import { useState } from "react";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";
import { ImageGrid }        from "./ImageGrid";
import { ImageSearchForm }  from "./ImageSearchForm";

export interface AllImagesProps {
  images:     IApiImageData[];
  isLoading:  boolean;
  hasError:   boolean;
  onSearch:   (searchTerm: string) => void;
}

export function AllImages({
  images,
  isLoading,
  hasError,
  onSearch,
}: AllImagesProps) {
  const [searchString, setSearchString] = useState("");

  if (isLoading) return <p>Loading images…</p>;
  if (hasError)  return <p style={{ color: "red" }}>Error loading images.</p>;

  function handleSearchRequested() {
    onSearch(searchString);
  }

  return (
    <>
      <ImageSearchForm
        searchString={searchString}
        onSearchStringChange={setSearchString}
        onSearchRequested={handleSearchRequested}
      />
      <ImageGrid images={images} />
    </>
  );
}
