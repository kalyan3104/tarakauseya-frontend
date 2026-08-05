import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatINR, stockStatus } from "@/lib/format";
import { BarChart3 } from "lucide-react";

export default function AdminAnalytics() {
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

  // Products per collection
  const byCollection = {};
  productList.forEach((p) => {
    const k = p.collection || "Uncategorised";
    byCollection[k] = (byCollection[k] || 0) + 1;
  });
  const collectionRows = Object.entries(byCollection).sort((a, b) => b[1] - a[1]);
  const maxCol = Math.max(1, ...collectionRows.map((r) => r[1]));

  // Products per fabric
  const byFabric = {};
  productList.forEach((p) => {
    const k = p.fabric || "Other";
    byFabric[k] = (byFabric[k] || 0) + 1;
  });
  const fabricRows = Object.entries(byFabric).sort((a, b) => b[1] - a[1]);
  const maxFab = Math.max(1, ...fabricRows.map((r) => r[1]));

  const totalStock = invList.reduce((s, i) => s + Number(i.stock_quantity || 0), 0);
  const totalValue = productList.reduce((s, p) => s + Number(p.price || 0), 0);
  const avgPrice = productList.length ? totalValue / productList.length : 0;
  const featured = productList.filter((p) => p.featured).length;
  const newArrivals = productList.filter((p) => p.new_arrival).length;
  const lowStock = invList.filter((i) => stockStatus(i) === "low_stock").length;

  const kpis = [
    { label: "Products", value: productList.length },
    { label: "Collections", value: collections?.length || 0 },
    { label: "Stock Units", value: totalStock },
    { label: "Avg. Price", value: formatINR(avgPrice) },
    { label: "Featured", value: featured },
    { label: "New Arrivals", value: newArrivals },
    { label: "Low Stock", value: lowStock },
    { label: "Catalogue Value", value: formatINR(totalValue) },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-luxe text-muted-foreground">Insights</p>
        <h1 className="font-display text-4xl mt-2">Analytics</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-background border border-border p-6">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <p className="font-display text-3xl mt-3">{k.value}</p>
            <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground mt-1.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Chart title="Products by Collection" rows={collectionRows} max={maxCol} />
        <Chart title="Products by Fabric" rows={fabricRows} max={maxFab} />
      </div>
    </div>
  );
}

function Chart({ title, rows, max }) {
  return (
    <div className="bg-background border border-border p-6">
      <h3 className="font-display text-xl mb-6">{title}</h3>
      <div className="space-y-3">
        {rows.map(([label, count]) => (
          <div key={label}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-light">{label}</span>
              <span className="text-muted-foreground">{count}</span>
            </div>
            <div className="h-1.5 bg-secondary">
              <div className="h-full bg-foreground" style={{ width: `${(count / max) * 100}%` }} />
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No data.</p>}
      </div>
    </div>
  );
}