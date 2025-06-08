// src/App.tsx
import { useState } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"

import { MainLayout } from "./MainLayout"
import { AllImages }   from "./images/AllImages"
import { ImageDetails } from "./images/ImageDetails"
import { LoginPage }   from "./LoginPage"
import { ProtectedRoute } from "./ProtectedRoute"
import { UploadPage }    from "./UploadPage"
import { ImageSearchForm } from "./images/ImageSearchForm";

import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData"

export default function App() {
  const [searchString, setSearchString] = useState("");
  const [images,   setImages]   = useState<IApiImageData[]>([])
  const [isLoading, setLoading] = useState(false)
  const [hasError, setError]    = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const navigate = useNavigate();

  async function fetchImages(token: string, search?: string) {
    setLoading(true);
    setError(false);
    try {
      const url = search
        ? `/api/images?search=${encodeURIComponent(search)}`
        : "/api/images";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setImages(await res.json());
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleLoginSuccess(token: string) {
    setAuthToken(token)
    fetchImages(token)
    navigate("/", { replace: true });
  }

  function handleSearchRequested() {
    if (!authToken) return;
    fetchImages(authToken, searchString);
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
                searchPanel={
                  <ImageSearchForm
                    searchString={searchString}
                    onSearchStringChange={setSearchString}
                    onSearchRequested={handleSearchRequested}
                  />
                }
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
                onNameSaved={(id, newName) =>
                  setImages(imgs =>
                    imgs.map(img =>
                      (img._id === id ? { ...img, name: newName } : img)
                    )
                  )
                }
              />
            </ProtectedRoute>
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
        {/* catch-all → login */}
        <Route
          path="*"
          element={
            <LoginPage
              isRegistering={false}
              onLoginSuccess={handleLoginSuccess}
            />
          }
        />
      </Route>
    </Routes>
  )
}
