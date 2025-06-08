// src/App.tsx
import { useState } from "react";
import { Routes, Route } from "react-router-dom"; // <-- from react-router-dom

import { MainLayout } from "./MainLayout";
import { AllImages } from "./images/AllImages";
import { ImageDetails } from "./images/ImageDetails";
import { LoginPage } from "./LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";

import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";
import { UploadPage } from "./UploadPage";

export default function App() {
  const [images, setImages] = useState<IApiImageData[]>([]);
  const [isLoading] = useState(true);
  const [hasError] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  function handleLoginSuccess(token: string) {
    setAuthToken(token);
    // …later, trigger fetch("/api/images") with Authorization header…
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path="/login"
          element={
            <LoginPage
              isRegistering={false}
              onLoginSuccess={handleLoginSuccess}
            />
          }
        />
        <Route
          path="/register"
          element={
            <LoginPage
              isRegistering={true}
              onLoginSuccess={handleLoginSuccess}
            />
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute authToken={authToken}>
              <AllImages
                images={images}
                isLoading={isLoading}
                hasError={hasError}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/images/:imageId"
          element={
            <ProtectedRoute authToken={authToken}>
              <ImageDetails
                images={images}
                isLoading={isLoading}
                hasError={hasError}
                onNameSaved={(id, newName) => {
                  setImages((prev) =>
                    prev.map((img) =>
                      img._id === id ? { ...img, name: newName } : img
                    )
                  );
                }}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <LoginPage
              isRegistering={false}
              onLoginSuccess={handleLoginSuccess}
            />
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute authToken={authToken}>
              <UploadPage authToken={authToken!} />
            </ProtectedRoute>
          }
          />
      </Route>
    </Routes>
  );
}
