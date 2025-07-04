// src/images/ImageGrid.tsx
import { Link } from "react-router-dom";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData.ts";
import "./Images.css";

interface Props {
  images: IApiImageData[];
}

export function ImageGrid({ images }: Props) {
  return (
    <div className="ImageGrid">
      {images.map(img => (
        <div key={img._id} className="ImageGrid-photo-container">
          <Link to={`/images/${img._id}`}>
            <img src={img.src} alt={img.name} />
          </Link>
        </div>
      ))}
    </div>
  );
}
