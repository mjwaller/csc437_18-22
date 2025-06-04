// src/images/ImageDetails.tsx
import { useParams } from "react-router";
import { ImageNameEditor } from "./ImageNameEditor";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData.ts";

export interface ImageDetailsProps {
    images: IApiImageData[];
    isLoading: boolean;
    hasError: boolean;
    onNameSaved: (id: string, newName: string) => void;
  }

export function ImageDetails(props: ImageDetailsProps) {
    const {images} = props;
  
    const { imageId } = useParams();           // already importing from react-router
    const image = images.find(img => img.id === imageId);
  
    /* loading & error handling identical to before … */
  
    if (!image) return <p>Image not found.</p>;
  
    return (
      <div>
        <h2>{image.name}</h2>
        <p>By {image.author.username}</p>
  
        {/* ⬇️ newly inserted editor */}
        <ImageNameEditor
          imageId={image.id}
          initialValue={image.name}
          onNameSaved={props.onNameSaved}
        />
  
        <img className="ImageDetails-img" src={image.src} alt={image.name} />
      </div>
    );
};
