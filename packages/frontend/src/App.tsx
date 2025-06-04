import { useEffect, useState } from "react";
import { Routes, Route } from "react-router";
import { ValidRoutes } from "csc437-monorepo-backend/src/common/ValidRoutes.ts";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";

import { AllImages } from "./images/AllImages";
import { ImageDetails } from "./images/ImageDetails";
import { LoginPage } from "./LoginPage";
import { MainLayout } from "./MainLayout";

export default function App() {
  /*  state that *persists* while user navigates */
  const [images, setImages]   = useState<IApiImageData[]>([]);
  const [isLoading, setLoad]  = useState(true);
  const [hasError, setError]  = useState(false);

  /* fetch once on mount */
  useEffect(() => {
    fetch("/api/images")
      .then(r => {
        if (!r.ok) throw new Error(`bad status ${r.status}`);
        return r.json() as Promise<IApiImageData[]>;
      })
      .then(data => setImages(data))
      .catch(() => setError(true))
      .finally(() => setLoad(false));
  }, []);

  function handleNameSaved(id: string, newName: string) {
    setImages(prev =>
      prev.map(img => (img.id === id ? { ...img, name: newName } : img))
    );
  }

  return (
    <Routes>
      <Route element={<MainLayout />}> {/* nested layout keeps header alive */}
        <Route
          path={ValidRoutes.HOME}
          element={
            <AllImages images={images} isLoading={isLoading} hasError={hasError} />
          }
        />
        <Route
          path={ValidRoutes.LOGIN}
          element={<LoginPage />}
        />
        <Route
          path={`${ValidRoutes.IMAGES_LIST}/:imageId`}
          element={
            <ImageDetails
              images={images}
              isLoading={isLoading}
              hasError={hasError}
              onNameSaved={handleNameSaved}   
            />
          }
        />
      </Route>
    </Routes>
  );
}
