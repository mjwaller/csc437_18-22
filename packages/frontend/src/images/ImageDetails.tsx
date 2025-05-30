// src/images/ImageDetails.tsx
import { useParams } from "react-router";
import type { IImageData } from "../MockAppData.ts";

interface Props {
  images: IImageData[];
}

export function ImageDetails({ images }: Props) {
  const { id } = useParams();               // ← “id” comes from the URL
  const image  = images.find(img => img.id === id);

  if (!image) return <h2>Image not found</h2>;

  return (
    <>
      <h2>{image.name}</h2>
      <p>By {image.author.username}</p>
      <img className="ImageDetails-img" src={image.src} alt={image.name} />
    </>
  );
}
