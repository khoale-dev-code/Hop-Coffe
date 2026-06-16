import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-white text-neutral-950 antialiased">
      <div className="relative min-h-[100dvh] bg-white">
        <Outlet />
      </div>
    </div>
  );
}