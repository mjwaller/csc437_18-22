/* AllImages.tsx */
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData.ts";
import { ImageGrid } from "./ImageGrid.tsx";

export interface AllImagesProps {
    images: IApiImageData[];
    isLoading: boolean;
    hasError: boolean;
}


export function AllImages(props: AllImagesProps) {
    if (props.isLoading) return <p>Loading images…</p>;
    if (props.hasError)  return <p style={{color: "red"}}>Error loading images.</p>;
    return <ImageGrid images={props.images} />;
}
