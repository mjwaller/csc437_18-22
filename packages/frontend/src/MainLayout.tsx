// src/MainLayout.tsx
import { Outlet } from "react-router";
import { Header } from "./Header.tsx";

export function MainLayout() {
  return (
    <div>
      <Header />
      <div style={{ padding: "0 2em" }}>
        <Outlet />   {/* child pages render here */}
      </div>
    </div>
  );
}