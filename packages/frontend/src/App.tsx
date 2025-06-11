// src/App.tsx
import { useState } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"

import { MainLayout }    from "./MainLayout"
import { AllImages }     from "./images/AllImages"
import { ImageDetails }  from "./images/ImageDetails"
import { LoginPage }     from "./LoginPage"
import { ProtectedRoute }from "./ProtectedRoute"
import { UploadPage }    from "./UploadPage"

import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData"

export default function App() {
  const [allImages,    setAllImages]       = useState<IApiImageData[]>([])
  const [displayedImages, setDisplayedImages] = useState<IApiImageData[]>([])
  const [isLoading,    setLoading]         = useState(false)
  const [hasError,     setError]           = useState(false)
  const [authToken,    setAuthToken]       = useState<string | null>(null)
  const navigate = useNavigate()

  // fetch (all) images from the server
  async function loadAllImages(token: string) {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch("/api/images", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const data = (await res.json()) as IApiImageData[]
      setAllImages(data)
      setDisplayedImages(data)    // <-- show them all in the grid
    } catch (err) {
      console.error("Fetch images failed:", err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function handleLoginSuccess(token: string) {
    setAuthToken(token)
    loadAllImages(token)
    navigate("/", { replace: true })
  }

  // called by the search form
  async function handleImageSearch(searchTerm: string) {
    if (!authToken) return
    setLoading(true)
    setError(false)
    const url = searchTerm
      ? `/api/images?search=${encodeURIComponent(searchTerm)}`
      : "/api/images"
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const data = (await res.json()) as IApiImageData[]
      setDisplayedImages(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* public: login + register */}
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

        {/* protected: gallery, details, upload */}
        <Route
          path="/"
          element={
            <ProtectedRoute authToken={authToken}>
              <AllImages
                images={displayedImages}    // <-- show filtered
                isLoading={isLoading}
                hasError={hasError}
                onSearch={handleImageSearch}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/images/:imageId"
          element={
            <ProtectedRoute authToken={authToken}>
              <ImageDetails
                images={allImages}           // <-- always full set
                isLoading={isLoading}
                hasError={hasError}
                onNameSaved={(id, newName) =>
                  setAllImages(imgs =>
                    imgs.map(img =>
                      img._id === id ? { ...img, name: newName } : img
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

        {/* fallback → login */}
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
