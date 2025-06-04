// src/images/ImageGrid.tsx
import { Link } from "react-router";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData.ts";
import "./Images.css";

interface Props {
  images: IApiImageData[];
}

export function ImageGrid({ images }: Props) {
  return (
    <div className="ImageGrid">
      {images.map(img => (
        <div key={img.id} className="ImageGrid-photo-container">
          <Link to={`/images/${img.id}`}>
            <img src={img.src} alt={img.name} />
          </Link>
        </div>
      ))}
    </div>
  );
}
