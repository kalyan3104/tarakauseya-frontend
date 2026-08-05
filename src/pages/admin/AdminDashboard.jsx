import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Package, FolderTree, Boxes, AlertTriangle, PackageX, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { formatINR, stockStatus } from "@/lib/format";

export default function AdminDashboard() {
  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => base44.entities.Product.list("-created_date", 200),
  });
  const { data: collections } = useQuery({
    queryKey: ["admin-collections"],
    queryFn: () => base44.entities.Collection.list("display_order", 100),
  });
  const { data: inventory } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: () => base44.entities.Inventory.list("-created_date", 200),
  });

  const productList = products || [];
  const invList = inventory || [];

  const totalStock = invList.reduce((s, i) => s + Number(i.stock_quantity || 0), 0);
  const lowStock = invList.filter((i) => stockStatus(i) === "low_stock").length;
  const outStock = invList.filter((i) => stockStatus(i) === "out_of_stock").length;
  const totalValue = productList.reduce((s, p) => s + Number(p.price || 0), 0);

  const stats = [
    { label: "Total Products", value: productList.length, icon: Package },
    { label: "Collections", value: collections?.length || 0, icon: FolderTree },
    { label: "Inventory Units", value: totalStock, icon: Boxes },
    { label: "Catalogue Value", value: formatINR(totalValue), icon: TrendingUp },
  ];

  const recent = productList.slice(0, 6);

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <p className="text-[11px] uppercase tracking-luxe text-muted-foreground">Overview</p>
        <h1 className="font-display text-4xl mt-2">Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-background border border-border p-6">
            <div className="flex items-center justify-between">
              <s.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="font-display text-3xl mt-4">{s.value}</p>
            <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground mt-1.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Stock alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-background border border-border p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-display text-2xl">{lowStock}</p>
            <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">Low Stock Items</p>
          </div>
        </div>
        <div className="bg-background border border-border p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
            <PackageX className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-display text-2xl">{outStock}</p>
            <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">Out of Stock</p>
          </div>
        </div>
      </div>

      {/* Recent products */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl">Recent Products</h2>
          <Link to="/admin/products" className="text-[11px] uppercase tracking-luxe-sm editorial-link">View all</Link>
        </div>
        <div className="bg-background border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-luxe-sm text-muted-foreground">
                <th className="text-left p-4 font-normal">Product</th>
                <th className="text-left p-4 font-normal">Collection</th>
                <th className="text-left p-4 font-normal">Fabric</th>
                <th className="text-right p-4 font-normal">Price</th>
                <th className="text-left p-4 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => (
                <tr key={p.id} className="border-b border-border/60 hover:bg-secondary/40">
                  <td className="p-4">{p.name}</td>
                  <td className="p-4 text-muted-foreground">{p.collection || "—"}</td>
                  <td className="p-4 text-muted-foreground">{p.fabric || "—"}</td>
                  <td className="p-4 text-right">{formatINR(p.price)}</td>
                  <td className="p-4">
                    <span className={p.active ? "text-emerald-600" : "text-muted-foreground"}>
                      {p.active ? "Active" : "Archived"}
                    </span>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}