import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import AccountMenu from "@/components/site/AccountMenu";

const NAV = [
  { label: "Collections", path: "/collections" },
  { label: "Sarees", path: "/sarees" },
  { label: "Heritage", path: "/about" },
  { label: "Journal", path: "/journal" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState(() => new URLSearchParams(location.search).get("q") || "");
  const { count } = useCart();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const submitSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/sarees?q=${encodeURIComponent(query)}` : "/sarees");
    setOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="container-luxe flex items-center justify-between h-16 md:h-20">
        <nav className="hidden md:flex items-center gap-9 flex-1">
          {NAV.slice(0, 3).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="editorial-link text-[12px] uppercase tracking-luxe-sm text-foreground/80 hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link to="/" className="flex flex-col items-center md:flex-1 md:items-center">
          <span className="font-display text-xl md:text-2xl tracking-wide leading-none">Varahi Kauseya</span>
          <span className="hidden md:block text-[9px] uppercase tracking-luxe text-muted-foreground mt-1">
            Heritage Luxury Sarees
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-9 flex-1 justify-end">
          {NAV.slice(3).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="editorial-link text-[12px] uppercase tracking-luxe-sm text-foreground/80 hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <form onSubmit={submitSearch} className="flex items-center gap-2 border-b border-foreground/40 px-1 py-1 focus-within:border-foreground transition-colors">
            <Search className="w-3.5 h-3.5 text-foreground/60 shrink-0" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search sarees or SKU"
              aria-label="Search sarees or SKU"
              className="w-32 bg-transparent text-xs font-light placeholder:text-muted-foreground focus:outline-none"
            />
          </form>
          <Link
            to="/cart"
            className="relative editorial-link text-[12px] uppercase tracking-luxe-sm text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[9px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <AccountMenu isAdmin={isAdmin} />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <Link
            to="/cart"
            className="relative flex items-center justify-center h-10 w-10 rounded-full border border-foreground/30 hover:bg-foreground hover:text-background transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[9px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <AccountMenu isAdmin={isAdmin} />
          <button
            className="p-2 -mr-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-background border-t border-border">
          <nav className="container-luxe py-6 flex flex-col gap-5">
            {NAV.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm uppercase tracking-luxe-sm text-foreground/80"
              >
                {item.label}
              </Link>
            ))}
            <form onSubmit={submitSearch} className="flex items-center gap-3 border-b border-border py-3">
              <Search className="w-4 h-4 text-foreground/60" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search sarees, colours or SKU"
                aria-label="Search sarees, colours or SKU"
                className="w-full bg-transparent text-sm font-light placeholder:text-muted-foreground focus:outline-none"
              />
            </form>
            <Link
              to="/cart"
              className="text-sm uppercase tracking-luxe-sm text-foreground/80"
            >
              Cart{count > 0 ? ` (${count})` : ""}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
