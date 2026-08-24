import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/site/PageHeader";
import ProductCard from "@/components/site/ProductCard";
import Reveal from "@/components/site/Reveal";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "-created_date", label: "Newest" },
  { value: "price", label: "Price · Low to High" },
  { value: "-price", label: "Price · High to Low" },
  { value: "name", label: "Name · A–Z" },
];

const FABRICS = ["Silk", "Cotton", "Organza", "Handloom", "Tussar"];
const OCCASIONS = ["Bridal", "Wedding", "Festive", "Everyday"];

export default function Sarees() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(() => params.get("q") || "");
  const [sort, setSort] = useState("-created_date");
  const [showFilters, setShowFilters] = useState(false);

  const collection = params.get("collection") || "";
  const fabric = params.get("fabric") || "";
  const occasion = params.get("occasion") || "";

  const query = useMemo(() => {
    const q = { active: true };
    if (collection) q.collection = collection.charAt(0).toUpperCase() + collection.slice(1);
    if (fabric) q.fabric = fabric;
    if (occasion) q.occasion = occasion;
    return q;
  }, [collection, fabric, occasion]);

  const { data, isLoading } = useQuery({
    queryKey: ["sarees", query, sort],
    queryFn: () => base44.entities.Product.filter(query, sort, 60),
  });

  const products = useMemo(() => {
    let list = data || [];
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          [p.name, p.fabric, p.colour, p.sku, p.border, p.pattern, p.occasion, p.collection]
            .some((field) => field?.toLowerCase().includes(s))
      );
    }
    return list;
  }, [data, search]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const clearAll = () => {
    setSearch("");
    setParams({}, { replace: true });
  };

  const updateSearch = (value) => {
    setSearch(value);
    const next = new URLSearchParams(params);
    if (value.trim()) next.set("q", value);
    else next.delete("q");
    setParams(next, { replace: true });
  };

  const activeFilters = [collection, fabric, occasion].filter(Boolean).length;

  return (
    <>
      <PageHeader
        eyebrow="The Catalogue"
        title="Sarees"
        intro="Browse the full atelier. Filter by fabric, occasion or collection — each piece is handwoven and singular."
      />

      <section className="py-12 md:py-16">
        <div className="container-luxe">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
            <div className="flex items-center gap-3 flex-1 max-w-md border-b border-foreground/30 pb-2 focus-within:border-foreground transition-colors">
              <Search className="w-4 h-4 text-foreground/60 shrink-0" />
              <input
                value={search}
                onChange={(e) => updateSearch(e.target.value)}
                placeholder="Search by weave, colour or SKU"
                aria-label="Search sarees by weave, colour or SKU"
                className="w-full bg-transparent text-sm font-light placeholder:text-muted-foreground focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => updateSearch("")}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters((v) => !v)}
                className="flex items-center gap-2 text-[11px] uppercase tracking-luxe-sm border border-border px-4 py-2.5 hover:bg-secondary transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {activeFilters > 0 && (
                  <span className="bg-foreground text-background px-1.5 text-[9px]">{activeFilters}</span>
                )}
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-[11px] uppercase tracking-luxe-sm border border-border px-4 py-2.5 bg-transparent focus:outline-none cursor-pointer"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {collection && <Chip label={collection} onClear={() => setParam("collection", "")} />}
              {fabric && <Chip label={fabric} onClear={() => setParam("fabric", "")} />}
              {occasion && <Chip label={occasion} onClear={() => setParam("occasion", "")} />}
              <button onClick={clearAll} className="text-[11px] uppercase tracking-luxe-sm text-muted-foreground editorial-link">
                Clear all
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 mt-8">
            {/* Filters sidebar */}
            <aside className={cn("lg:block", showFilters ? "block" : "hidden")}>
              <FilterGroup title="Fabric" options={FABRICS} value={fabric} onSelect={(v) => setParam("fabric", v === fabric ? "" : v)} />
              <FilterGroup title="Occasion" options={OCCASIONS} value={occasion} onSelect={(v) => setParam("occasion", v === occasion ? "" : v)} />
            </aside>

            {/* Grid */}
            <div>
              {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-12">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                      <div className="aspect-[3/4] skeleton" />
                      <div className="mt-5 h-3 w-1/3 skeleton" />
                      <div className="mt-3 h-4 w-2/3 skeleton" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="font-display text-3xl">Nothing found</p>
                  <p className="mt-3 text-muted-foreground font-light">Try adjusting your filters or search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-12">
                  {products.map((p, i) => (
                    <Reveal key={p.id} delay={(i % 3) * 0.06}>
                      <ProductCard product={p} index={i} />
                    </Reveal>
                  ))}
                </div>
              )}
              <p className="mt-12 text-[11px] uppercase tracking-luxe-sm text-muted-foreground">
                Showing {products.length} {products.length === 1 ? "piece" : "pieces"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Chip({ label, onClear }) {
  return (
    <span className="inline-flex items-center gap-2 border border-border px-3 py-1.5 text-[11px] uppercase tracking-luxe-sm">
      {label}
      <button onClick={onClear} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
    </span>
  );
}

function FilterGroup({ title, options, value, onSelect }) {
  return (
    <div className="pb-8 border-b border-border mb-8">
      <p className="text-[11px] uppercase tracking-luxe text-foreground mb-4">{title}</p>
      <ul className="space-y-2.5">
        {options.map((o) => (
          <li key={o}>
            <button
              onClick={() => onSelect(o)}
              className={cn(
                "text-sm font-light editorial-link text-left",
                value === o ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {o}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}