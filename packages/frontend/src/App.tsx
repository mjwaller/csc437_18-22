// frontend/src/App.tsx
import { useEffect, useState, useRef } from "react";
import { Routes, Route } from "react-router";

import { MainLayout } from "./MainLayout";
import { AllImages } from "./images/AllImages";
import { ImageDetails } from "./images/ImageDetails";
import { LoginPage } from "./LoginPage";
import { ImageSearchForm } from "./images/ImageSearchForm";

import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";
import { ValidRoutes } from "csc437-monorepo-backend/src/common/ValidRoutes";

export default function App() {

  const [images, setImages]   = useState<IApiImageData[]>([]);
  const [isLoading, setLoad]  = useState<boolean>(true);
  const [hasError,  setError] = useState<boolean>(false);

  // (b) search box text
  const [searchString, setSearchString] = useState<string>("");


  const latestRequestNumberRef = useRef<number>(0);


  function fetchImages(search?: string) {

    latestRequestNumberRef.current += 1;
    const thisRequestNumber = latestRequestNumberRef.current;


    setLoad(true);
    setError(false);

    const url = search && search.trim().length > 0
      ? `/api/images?search=${encodeURIComponent(search.trim())}`
      : `/api/images`;

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`bad status ${r.status}`);
        return r.json() as Promise<IApiImageData[]>;
      })
      .then(data => {
        if (thisRequestNumber === latestRequestNumberRef.current) {
          setImages(data);
        }
      })
      .catch(() => {
        if (thisRequestNumber === latestRequestNumberRef.current) {
          setError(true);
        }
      })
      .finally(() => {
        if (thisRequestNumber === latestRequestNumberRef.current) {
          setLoad(false);
        }
      });
  }

  useEffect(() => {
    fetchImages(); // fetch all images once
  }, []);


  function handleImageSearch() {
    // trigger a new fetch with the current searchString
    fetchImages(searchString);
  }

  function handleNameSaved(id: string, newName: string) {
    // Let’s update our local “images” array immediately (optimistic UI).
    setImages(prev =>
      prev.map(img => (img.id === id ? { ...img, name: newName } : img))
    );
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path={ValidRoutes.HOME}
          element={
            <AllImages
              images={images}
              isLoading={isLoading}
              hasError={hasError}
              // Pass <ImageSearchForm …/> as the “searchPanel” prop:
              searchPanel={
                <ImageSearchForm
                  searchString={searchString}
                  onSearchStringChange={setSearchString}
                  onSearchRequested={handleImageSearch}
                />
              }
            />
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
