import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

export default function AccountMenu({ isAdmin: propIsAdmin }) {
  const { user, isAuthenticated, logout, isAdmin: authIsAdmin } = useAuth();
  const isAdmin = propIsAdmin ?? authIsAdmin;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="text-[11px] uppercase tracking-luxe-sm border border-foreground/40 px-4 py-2 hover:bg-foreground hover:text-background transition-colors duration-300"
      >
        Login
      </Link>
    );
  }

  const initials = (user?.full_name || user?.email || "U")
    .trim()
    .slice(0, 1)
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-[11px] uppercase tracking-luxe-sm border border-foreground/40 px-3 py-1.5 hover:bg-foreground hover:text-background transition-colors duration-300"
      >
        <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center font-body text-[10px]">
          {initials}
        </span>
        Account
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-background border border-border shadow-lg z-50">
          <div className="p-4 border-b border-border">
            <p className="text-xs font-medium truncate">{user?.full_name || "Account"}</p>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
            {isAdmin && <span className="inline-block mt-2 text-[9px] uppercase tracking-luxe-sm text-accent">Admin</span>}
          </div>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-xs hover:bg-secondary transition-colors"
            >
              <User className="w-3.5 h-3.5" /> Atelier Dashboard
            </Link>
          )}
          <button
            onClick={() => logout("/")}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs hover:bg-secondary transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}