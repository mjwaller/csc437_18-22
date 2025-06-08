// frontend/src/MainLayout.tsx
import { Header } from "./Header";
import { Outlet } from "react-router-dom";
import "./Header.css"; // (assuming you have a Header/CSS)

export function MainLayout() {
  return (
    <div>
      <Header/>
      <main style={{ padding: "1em" }}>
        <Outlet />
      </main>
      <div style={{ padding: "0 2em" }}>
      </div>
    </div>
  );
}
