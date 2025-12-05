import { Outlet } from "react-router-dom";
import Sidebar from "./ui/sidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Sidebar />
      <div className="pl-60 min-h-screen">
        <main className="min-h-screen p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
