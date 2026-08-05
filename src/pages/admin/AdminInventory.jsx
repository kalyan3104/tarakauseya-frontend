import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { stockStatus } from "@/lib/format";
import { Search, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminInventory() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [edits, setEdits] = useState({});

  const { data: inventory } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: () => base44.entities.Inventory.list("-created_date", 200),
  });
  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => base44.entities.Product.list("-created_date", 200),
  });

  const productMap = useMemo(() => {
    const m = {};
    (products || []).forEach((p) => { m[p.id] = p; });
    return m;
  }, [products]);

  const list = useMemo(() => {
    let l = inventory || [];
    if (search.trim()) {
      const s = search.toLowerCase();
      l = l.filter((i) => i.sku?.toLowerCase().includes(s) || productMap[i.product_id]?.name?.toLowerCase().includes(s));
    }
    return l;
  }, [inventory, search, productMap]);

  const save = async (item) => {
    const patch = edits[item.id];
    if (!patch) return;
    await base44.entities.Inventory.update(item.id, patch);
    await base44.entities.InventoryLog.create({
      product_id: item.product_id,
      sku: item.sku,
      action: "adjust",
      quantity: Number(patch.stock_quantity ?? item.stock_quantity),
      note: "Manual adjustment",
    });
    setEdits((e) => { const n = { ...e }; delete n[item.id]; return n; });
    qc.invalidateQueries({ queryKey: ["admin-inventory"] });
  };

  const setField = (id, key, val) => setEdits((e) => ({ ...e, [id]: { ...e[id], [key]: val } }));

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-luxe text-muted-foreground">Stock</p>
        <h1 className="font-display text-4xl mt-2">Inventory</h1>
      </div>

      <div className="flex items-center gap-2 border border-border px-3 py-2 mb-6 max-w-xs">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search SKU or product…" className="bg-transparent text-sm font-light focus:outline-none w-full" />
      </div>

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-luxe-sm text-muted-foreground">
              <th className="text-left p-4 font-normal">Product</th>
              <th className="text-left p-4 font-normal">SKU</th>
              <th className="text-center p-4 font-normal">In Stock</th>
              <th className="text-center p-4 font-normal">Reserved</th>
              <th className="text-center p-4 font-normal">Incoming</th>
              <th className="text-center p-4 font-normal">Min Stock</th>
              <th className="text-left p-4 font-normal">Warehouse</th>
              <th className="text-left p-4 font-normal">Status</th>
              <th className="text-right p-4 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {!inventory && (
              <tr><td colSpan={9} className="p-12 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
            )}
            {list.map((item) => {
              const status = stockStatus(item);
              const e = edits[item.id] || {};
              return (
                <tr key={item.id} className="border-b border-border/60 hover:bg-secondary/40">
                  <td className="p-4">{productMap[item.product_id]?.name || "—"}</td>
                  <td className="p-4 text-muted-foreground font-mono text-xs">{item.sku}</td>
                  <td className="p-2"><input type="number" value={e.stock_quantity ?? item.stock_quantity ?? 0} onChange={(ev) => setField(item.id, "stock_quantity", ev.target.value)} className="vk-inv-input" /></td>
                  <td className="p-2"><input type="number" value={e.reserved ?? item.reserved ?? 0} onChange={(ev) => setField(item.id, "reserved", ev.target.value)} className="vk-inv-input" /></td>
                  <td className="p-2"><input type="number" value={e.incoming ?? item.incoming ?? 0} onChange={(ev) => setField(item.id, "incoming", ev.target.value)} className="vk-inv-input" /></td>
                  <td className="p-2"><input type="number" value={e.minimum_stock ?? item.minimum_stock ?? 0} onChange={(ev) => setField(item.id, "minimum_stock", ev.target.value)} className="vk-inv-input" /></td>
                  <td className="p-2"><input value={e.warehouse_location ?? item.warehouse_location ?? ""} onChange={(ev) => setField(item.id, "warehouse_location", ev.target.value)} className="vk-inv-input" /></td>
                  <td className="p-4">
                    <span className={cn("text-[10px] uppercase tracking-luxe-sm",
                      status === "out_of_stock" ? "text-red-600" : status === "low_stock" ? "text-amber-600" : "text-emerald-600")}>
                      {status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => save(item)} disabled={!edits[item.id]} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-luxe-sm disabled:opacity-30">
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  </td>
                </tr>
              );
            })}
            {inventory && list.length === 0 && (
              <tr><td colSpan={9} className="p-12 text-center text-muted-foreground">No inventory records. Stock is created when you add products.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`.vk-inv-input{width:72px;background:transparent;border:1px solid hsl(var(--border));padding:.3rem .4rem;font-size:.8rem;font-weight:300;text-align:center;outline:none}.vk-inv-input:focus{border-color:hsl(var(--foreground))}`}</style>
    </div>
  );
}