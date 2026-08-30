import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { formatINR } from "@/lib/format";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

const inputCls = "w-full bg-background border border-border px-4 py-3 text-sm font-light focus:outline-none focus:border-foreground";
const getSavedAddressKey = (userId) => `tara_kauseya_saved_addresses_${userId || "guest"}`;
const readSavedAddresses = (userId) => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getSavedAddressKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const writeSavedAddresses = (userId, addresses) => {
  if (!userId) return;
  localStorage.setItem(getSavedAddressKey(userId), JSON.stringify(addresses));
};
const sameAddress = (left, right) =>
  left && right &&
  (left.address || "") === (right.address || "") &&
  (left.city || "") === (right.city || "") &&
  (left.pincode || "") === (right.pincode || "") &&
  (left.phone || "") === (right.phone || "");

export default function Payment() {
  const { items, clear } = useCart();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "", pincode: "" });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setSavedAddresses([]);
      setSelectedSavedAddressId("");
      return;
    }

    const existing = readSavedAddresses(user.id);
    setSavedAddresses(existing);
    if (existing.length === 0) {
      setSelectedSavedAddressId("");
    }
  }, [isAuthenticated, user?.id]);

  const applySavedAddress = (addressId) => {
    const selected = savedAddresses.find((item) => item.id === addressId);
    if (!selected) {
      setSelectedSavedAddressId("");
      setForm((current) => ({ ...current, name: "", phone: "", email: "", address: "", city: "", pincode: "" }));
      return;
    }

    setSelectedSavedAddressId(addressId);
    setForm((current) => ({
      ...current,
      name: selected.name || current.name,
      phone: selected.phone || current.phone,
      email: selected.email || current.email,
      address: selected.address || current.address,
      city: selected.city || current.city,
      pincode: selected.pincode || current.pincode,
    }));
  };

  const pay = async (event) => {
    event.preventDefault();
    if (!isAuthenticated || !user?.id) {
      setError("Please sign in before placing your order.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const created = await base44.orders.createPaid({
        ...form,
        customer_id: user.id,
        customer_name: form.name,
        payment_status: "cod",
        status: "placed",
        items: items.map(({ id, name, slug, sku, price, image, collection }) => ({ product_id: id, name, slug, sku, price, image, collection })),
        item_count: items.length,
        total,
      });

      if (user?.id && form.name && form.phone && form.address && form.city && form.pincode) {
        const nextAddress = {
          id: `saved-${Date.now()}`,
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          pincode: form.pincode,
          createdAt: new Date().toISOString(),
        };
        const existing = readSavedAddresses(user.id);
        const deduped = [nextAddress, ...existing.filter((entry) => !sameAddress(entry, nextAddress))].slice(0, 10);
        setSavedAddresses(deduped);
        writeSavedAddresses(user.id, deduped);
      }

      setOrder(created);
      clear();
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    } catch (err) {
      setError(err?.message || "Order could not be placed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return <div className="pt-32 md:pt-40 pb-32 container-luxe text-center max-w-2xl mx-auto">
      <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
      <h1 className="font-display text-4xl md:text-5xl mt-6">Order placed</h1>
      <p className="mt-5 text-muted-foreground font-light">Thank you, {order.customer_name || form.name}. Your COD order is now with our atelier.</p>
      <div className="mt-8 border border-border p-6 text-left">
        <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">Order ID</p>
        <p className="font-mono text-sm mt-1 break-all">{order.id}</p>
        <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground mt-4">Payment</p>
        <p className="text-sm mt-1">Cash on delivery</p>
        <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground mt-4">Delivery address</p>
        <p className="text-sm mt-1 break-words">{[order.address || form.address, order.city || form.city, order.pincode || form.pincode].filter(Boolean).join(", ") || "Address saved"}</p>
      </div>
      <Link to="/account/orders" className="mt-8 inline-flex text-[11px] uppercase tracking-luxe-sm editorial-link">View my orders</Link>
    </div>;
  }

  if (items.length === 0) return <div className="pt-40 pb-32 container-luxe text-center"><p className="font-display text-4xl">Your cart is empty</p><Link to="/sarees" className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-luxe-sm editorial-link"><ArrowLeft className="w-3.5 h-3.5" /> Browse the collection</Link></div>;

  return <div className="pt-28 md:pt-32 pb-24"><div className="container-luxe"><div className="pt-16 pb-12 border-b border-border"><p className="text-[11px] uppercase tracking-luxe text-muted-foreground">Secure checkout</p><h1 className="font-display text-5xl md:text-7xl leading-tight mt-3">Payment</h1><p className="mt-5 max-w-xl text-muted-foreground font-light">Complete payment to place this order. Paid orders are handled separately from home-trial requests.</p></div>
    <form onSubmit={pay} className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16"><div className="lg:col-span-2 space-y-8"><section><h2 className="font-display text-2xl mb-5">Delivery details</h2>{savedAddresses.length > 0 && <div className="mb-5 sm:col-span-2"><label className="block"><span className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">Saved addresses</span><div className="mt-1.5 flex gap-3 items-center"><select value={selectedSavedAddressId} onChange={(event) => { const value = event.target.value; if (!value) { setSelectedSavedAddressId(""); setForm((current) => ({ ...current, name: "", phone: "", email: "", address: "", city: "", pincode: "" })); return; } applySavedAddress(value); }} className="w-full bg-background border border-border px-4 py-3 text-sm font-light focus:outline-none focus:border-foreground"><option value="">Enter a new address</option>{savedAddresses.map((address) => <option key={address.id} value={address.id}>{address.name} — {address.address}, {address.city} - {address.pincode}</option>)}</select></div></label></div>}<div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Field label="Full name *"><input className={inputCls} value={form.name} onChange={set("name")} required /></Field><Field label="Phone *"><input className={inputCls} value={form.phone} onChange={set("phone")} required type="tel" /></Field><Field label="Email"><input className={inputCls} value={form.email} onChange={set("email")} type="email" /></Field><Field label="Address *" className="sm:col-span-2"><textarea className={inputCls + " min-h-[90px]"} value={form.address} onChange={set("address")} required /></Field><Field label="City *"><input className={inputCls} value={form.city} onChange={set("city")} required /></Field><Field label="Pincode *"><input className={inputCls} value={form.pincode} onChange={set("pincode")} required inputMode="numeric" /></Field></div></section><section><h2 className="font-display text-2xl mb-5">Payment details</h2><p className="text-sm text-muted-foreground font-light">You will be securely redirected to Cashfree to choose your payment method.</p>{error && <p className="mt-4 text-xs text-destructive">{error}</p>}</section></div><aside className="lg:sticky lg:top-28 h-fit border border-border p-6 bg-card"><h2 className="font-display text-2xl">Order summary</h2><div className="mt-5 space-y-3">{items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span className="truncate">{item.name}</span><span>{formatINR(item.price)}</span></div>)}</div><div className="mt-5 pt-5 border-t border-border flex justify-between"><span className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">Total</span><span className="font-display text-xl">{formatINR(total)}</span></div><button type="submit" disabled={submitting} className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-4 text-[11px] uppercase tracking-luxe-sm disabled:opacity-50">{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "place order"}</button></aside></form></div></div>;
}

function Field({ label, children, className = "" }) { return <label className={"block " + className}><span className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">{label}</span><div className="mt-1.5">{children}</div></label>; }
