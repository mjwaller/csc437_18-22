// src/components/ImageNameEditor.tsx
import { useState } from "react";

interface INameEditorProps {
  imageId: string;
  initialValue: string;
  /* callback supplied by App so we can mutate global state */
  onNameSaved: (id: string, newName: string) => void;
}

export function ImageNameEditor(props: INameEditorProps) {
  const [isEditing, setEdit] = useState(false);
  const [input, setInput] = useState(props.initialValue);
  const [isWorking, setWork] = useState(false);
  const [hasError, setErr] = useState(false);

  async function handleSubmitPressed() {
    setWork(true);
    setErr(false);

    try {
      const response = await fetch(`/api/images/${props.imageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: input }),
      });

      if (response.status === 204 || response.ok) {
        props.onNameSaved(props.imageId, input);
        setEdit(false);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to PATCH /api/images/:id:", err);
      setErr(true);
    } finally {
      setWork(false);
    }
  }

  /* ---------- render ---------- */
  if (isEditing) {
    return (
      <div style={{ margin: "1em 0" }}>
        <label>
          New&nbsp;Name{" "}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isWorking}
          />
        </label>{" "}
        <button
          disabled={input.length === 0 || isWorking}
          onClick={handleSubmitPressed}
        >
          Submit
        </button>{" "}
        <button disabled={isWorking} onClick={() => setEdit(false)}>
          Cancel
        </button>
        {isWorking && <p>Working…</p>}
        {hasError && <p style={{ color: "red" }}>Network error.</p>}
      </div>
    );
  }

  /* not editing yet */
  return (
    <div style={{ margin: "1em 0" }}>
      <button onClick={() => setEdit(true)}>Edit name</button>
    </div>
  );
}
