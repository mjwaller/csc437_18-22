// frontend/src/UploadPage.tsx
import { useState } from "react";
import type {ChangeEvent, FormEvent } from "react";

interface UploadPageProps {
  authToken: string | null; // we will disable auth for now or supply a dummy.
}

export function UploadPage({ authToken }: UploadPageProps) {
  // 1) form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [imageName, setImageName]       = useState("");
  const [isWorking, setWorking]         = useState(false);
  const [errorMsg, setErrorMsg]         = useState<string | null>(null);
  const [successMsg, setSuccessMsg]     = useState<string | null>(null);

  // 2) Handle file selection → store File + generate data URL for preview
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setErrorMsg(null);
    setSuccessMsg(null);
    const files = e.currentTarget.files;
    if (!files || files.length === 0) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    const file = files[0];
    // tell React which file is selected:
    setSelectedFile(file);
    // now generate a data URL for live preview:
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.onerror = () => {
      setErrorMsg("Could not read file for preview.");
      setPreviewUrl(null);
    };
  }

  // 3) Handle form submission
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // 3a) Basic front-end validation:
    if (!selectedFile) {
      setErrorMsg("Please choose an image file.");
      return;
    }
    if (imageName.trim().length === 0) {
      setErrorMsg("Please enter a title.");
      return;
    }

    // 3b) Build a FormData and POST to /api/images
    setWorking(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("name", imageName.trim());

      const resp = await fetch("/api/images", {
        method: "POST",
        headers: authToken
          ? { Authorization: `Bearer ${authToken}` }
          : undefined,
        body: formData,
      });

      if (resp.status === 201) {
        setSuccessMsg("Upload succeeded!");
        setSelectedFile(null);
        setPreviewUrl(null);
        setImageName("");
      } else {
        // grab any JSON error if present, else show generic message
        let msg: string;
        try {
          const body = await resp.json();
          msg = body.message || "Upload failed.";
        } catch {
          msg = `Upload failed (status ${resp.status}).`;
        }
        setErrorMsg(msg);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error during upload.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div style={{ maxWidth: "30em", margin: "1em auto" }}>
      <h2>Upload a New Image</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* 1) file input */}
        <div style={{ marginBottom: "1em" }}>
          <label htmlFor="imageInput">Choose image to upload:</label>
          <input
            id="imageInput"
            name="image"
            type="file"
            accept=".png,.jpg,.jpeg"
            required
            disabled={isWorking}
            onChange={handleFileChange}
          />
        </div>

        {/* 2) title input */}
        <div style={{ marginBottom: "1em" }}>
          <label htmlFor="nameInput">
            Image title:
            <input
              id="nameInput"
              name="name"
              type="text"
              required
              disabled={isWorking}
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              style={{ marginLeft: "0.5em", width: "100%" }}
            />
          </label>
        </div>

        {/* 3) preview */}
        <div style={{ marginBottom: "1em" }}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Image preview"
              style={{ width: "20em", maxWidth: "100%" }}
            />
          ) : (
            <p style={{ color: "#666" }}>No preview yet</p>
          )}
        </div>

        {/* 4) submit */}
        <div style={{ marginBottom: "1em" }}>
          <button type="submit" disabled={isWorking}>
            {isWorking ? "Uploading…" : "Confirm upload"}
          </button>
        </div>

        {/* 5) error / success messages (aria-live) */}
        <div aria-live="polite" style={{ minHeight: "1.2em" }}>
          {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
          {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
        </div>
      </form>
    </div>
  );
}
