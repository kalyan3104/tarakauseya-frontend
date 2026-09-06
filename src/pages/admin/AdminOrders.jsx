import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatINR } from "@/lib/format";
import { Eye, X } from "lucide-react";

const STATUSES = ["placed", "processing", "shipped", "delivered", "cancelled"];

const formatOrderDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
};

export default function AdminOrders() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: () => base44.entities.Order.list("-created_date", 100) });
  const updateStatus = async (id, status) => { await base44.entities.Order.update(id, { status }); qc.invalidateQueries({ queryKey: ["admin-orders"] }); setSelected((current) => current?.id === id ? { ...current, status } : current); };

  return <div className="p-6 md:p-10"><div className="mb-8"><p className="text-[11px] uppercase tracking-luxe text-muted-foreground">Orders</p><h1 className="font-display text-4xl mt-2">Orders</h1></div>{isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : data.length === 0 ? <p className="text-sm text-muted-foreground">No orders yet.</p> : <div className="border border-border overflow-x-auto"><table className="w-full text-sm min-w-[860px]"><thead className="bg-secondary/50 text-left"><tr><th className="px-4 py-3 text-[10px] uppercase tracking-luxe-sm">Order ID</th><th className="px-4 py-3 text-[10px] uppercase tracking-luxe-sm">Customer</th><th className="px-4 py-3 text-[10px] uppercase tracking-luxe-sm">Phone</th><th className="px-4 py-3 text-[10px] uppercase tracking-luxe-sm">Placed</th><th className="px-4 py-3 text-[10px] uppercase tracking-luxe-sm">Total</th><th className="px-4 py-3 text-[10px] uppercase tracking-luxe-sm">Status</th><th className="px-4 py-3" /></tr></thead><tbody>{data.map((order) => <tr key={order.id} className="border-t border-border"><td className="px-4 py-3 font-mono text-xs">{order.id}</td><td className="px-4 py-3">{order.name}</td><td className="px-4 py-3 text-muted-foreground">{order.phone}</td><td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatOrderDate(order.created_date)}</td><td className="px-4 py-3">{formatINR(order.total)}</td><td className="px-4 py-3"><select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)} className="bg-background border border-border px-2 py-1 text-xs">{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></td><td className="px-4 py-3 text-right"><button onClick={() => setSelected(order)} className="text-muted-foreground hover:text-foreground" aria-label="View order"><Eye className="w-4 h-4" /></button></td></tr>)}</tbody></table></div>}
    {selected && <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}><div className="bg-background border border-border max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between p-6 border-b border-border"><h2 className="font-display text-2xl">Order details</h2><button onClick={() => setSelected(null)} aria-label="Close"><X className="w-5 h-5" /></button></div><div className="p-6 space-y-3 text-sm"><Detail label="Order ID">{selected.id}</Detail><Detail label="Placed">{formatOrderDate(selected.created_date)}</Detail><Detail label="Customer">{selected.name}</Detail><Detail label="Phone">{selected.phone}</Detail><Detail label="Address">{selected.address}, {selected.city} - {selected.pincode}</Detail><Detail label="Payment">{selected.payment_status}</Detail><Detail label="Status">{selected.status}</Detail><div className="pt-3"><p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground mb-2">Items</p>{(selected.items || []).map((item, index) => <div key={index} className="flex justify-between border-b border-border/50 pb-2 mb-2"><span>{item.name} <span className="text-muted-foreground">· {item.sku}</span></span><span>{formatINR(item.price)}</span></div>)}</div></div></div></div>}
  </div>;
}
function Detail({ label, children }) { return <div className="grid grid-cols-3 gap-4 border-b border-border/50 pb-3"><span className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">{label}</span><span className="col-span-2 font-light break-words">{children}</span></div>; }
