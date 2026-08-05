import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, FolderTree, Boxes, Image, BarChart3, ArrowLeft, UploadCloud, CalendarCheck, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";

const NAV = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Collections", path: "/admin/collections", icon: FolderTree },
  { label: "Inventory", path: "/admin/inventory", icon: Boxes },
  { label: "Media", path: "/admin/media", icon: Image },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "Bulk Import", path: "/admin/import", icon: UploadCloud },
  { label: "Trial Requests", path: "/admin/trials", icon: CalendarCheck },
];

export default function AdminLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => logout("/");

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 z-40 h-screen w-64 bg-background border-r border-border flex flex-col transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-border">
          <Link to="/" className="block">
            <p className="font-display text-xl leading-none">Varahi Kauseya</p>
            <p className="text-[9px] uppercase tracking-luxe text-muted-foreground mt-1.5">Atelier · Inventory</p>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => {
            const active = item.path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                  active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-2 py-2 bg-secondary/40">
              <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{user.full_name || "Admin"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-[11px] uppercase tracking-luxe-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-[11px] uppercase tracking-luxe-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="lg:hidden p-4 border-b border-border bg-background sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="text-[11px] uppercase tracking-luxe-sm">Menu</button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}