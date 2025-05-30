// src/App.tsx
import { Routes, Route } from "react-router";
import { useState } from "react";

import { MainLayout }   from "./MainLayout.tsx";
import { AllImages }    from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage }   from "./UploadPage.tsx";
import { LoginPage }    from "./LoginPage.tsx";
import { fetchDataFromServer } from "./MockAppData.ts";

export default function App() {
  const [images] = useState(fetchDataFromServer);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index        element={<AllImages    images={images} />} />
        <Route path="upload" element={<UploadPage            />}   />
        <Route path="login"  element={<LoginPage             />}   />
        <Route path="images/:id"
               element={<ImageDetails images={images} />} />
      </Route>
    </Routes>
  );
}
