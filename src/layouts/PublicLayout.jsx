import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <Outlet />
    </div>
  );
}