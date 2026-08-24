import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CheckCircle, Package, Truck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/site/PageHeader";
import { Image } from "@/components/ui/image";

const STEPS = [
  { key: "requested", label: "Confirmed", icon: CheckCircle },
  { key: "confirmed", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];
const STATUS_INDEX = { requested: 0, confirmed: 1, processing: 1, shipped: 2, delivered: 3, completed: 3 };
const STATUS_LABELS = {
  requested: "Confirmed",
  confirmed: "Processing",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};
const fmtDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function MyOrders() {
  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ["my-orders"],
    queryFn: base44.account.orders,
  });

  return (
    <>
      <PageHeader eyebrow="Your Account" title="My Orders" intro="Follow your home-trial requests and the pieces prepared for you." />
      <section className="py-12 md:py-16">
        <div className="container-luxe max-w-3xl">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading your orders…</p> : isError ? (
            <div className="border border-destructive/40 p-8 text-center">
              <p className="text-sm text-destructive">We couldn't load your orders right now. Please try again shortly.</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="border border-border p-10 text-center">
              <p className="font-display text-3xl">You haven't placed any orders yet.</p>
              <Link to="/sarees" className="mt-6 inline-block text-[11px] uppercase tracking-luxe-sm editorial-link">Browse sarees</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const current = STATUS_INDEX[order.status] ?? 0;
                const cancelled = order.status === "cancelled";
                return (
                  <article key={order.id} className="border border-border bg-card">
                    <div className="flex items-center justify-between gap-4 p-5 border-b border-border">
                      <div><p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">Order #{order.id}</p><p className="text-xs text-muted-foreground mt-1">Placed: {fmtDate(order.created_date)}</p></div>
                      <span className="text-[10px] uppercase tracking-luxe-sm border border-foreground/30 px-3 py-1.5">{STATUS_LABELS[order.status] || "Confirmed"}</span>
                    </div>
                    <div className="p-5 space-y-6">
                      <div className="space-y-3">{(order.items || []).map((item, index) => <div key={index} className="flex items-center gap-4">{item.image ? <Image src={item.image} alt={item.name || "Saree"} className="w-12 h-14 shrink-0" /> : <div className="w-12 h-14 shrink-0 bg-secondary" />}<Link to={item.slug ? `/saree/${item.slug}` : "/sarees"} className="text-sm hover:underline">{item.name || "Saree"}</Link></div>)}</div>
                      {!cancelled && <ol className="grid grid-cols-4 gap-2 border-t border-border pt-5">{STEPS.map((step, index) => { const Icon = step.icon; const done = index <= current; return <li key={step.key} className="flex flex-col items-center text-center gap-2"><span className={`w-9 h-9 rounded-full flex items-center justify-center border ${done ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground"}`}><Icon className="w-4 h-4" /></span><span className={`text-[10px] uppercase tracking-luxe-sm ${done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span></li>; })}</ol>}
                      {cancelled && <p className="text-sm text-destructive">This order was cancelled.</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
