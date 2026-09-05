import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { User, LogOut, ChevronDown, Package, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

export default function AccountMenu({ isAdmin: propIsAdmin }) {
  const { user, isAuthenticated, logout, isAdmin: authIsAdmin } = useAuth();
  const isAdmin = propIsAdmin ?? authIsAdmin;
  const [open, setOpen] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(true);
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
      <div className="relative">
        <Link
          to="/login"
          className="text-[11px] uppercase tracking-luxe-sm border border-foreground/40 px-4 py-2 hover:bg-foreground hover:text-background transition-colors duration-300"
        >
          Login
        </Link>
        {showLoginHint && (
          <div className="absolute right-0 top-full mt-3 w-64 bg-foreground text-background shadow-lg">
            <div className="p-4 pr-10 relative">
              <p className="text-xs font-medium">A smoother shopping experience awaits💎🛍️🛒</p>
              <p className="text-[11px] leading-relaxed text-background/70 mt-1.5">
                Log in to save your favourites , track your orders, and enjoy a smooth checkout experience.
              </p>
              <button
                type="button"
                onClick={() => setShowLoginHint(false)}
                className="absolute top-3 right-3 p-1 text-background/60 hover:text-background transition-colors"
                aria-label="Dismiss login message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
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
          <Link
            to="/account/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-xs hover:bg-secondary transition-colors"
          >
            <Package className="w-3.5 h-3.5" /> My Orders
          </Link>
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
