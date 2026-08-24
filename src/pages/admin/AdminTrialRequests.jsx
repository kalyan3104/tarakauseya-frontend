import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatINR } from "@/lib/format";
import { Eye, X } from "lucide-react";

const STATUSES = ["requested", "confirmed", "shipped", "delivered", "completed", "cancelled"];

export default function AdminTrialRequests() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["trial-requests"],
    queryFn: () => base44.entities.TrialRequest.list("-created_date", 100),
  });
  const list = data || [];
 
  const updateStatus = async (id, status) => {
    await base44.entities.TrialRequest.update(id, { status });
    qc.invalidateQueries({ queryKey: ["trial-requests"] });
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-luxe text-muted-foreground">Home Trials</p>
        <h1 className="font-display text-4xl mt-2">Trial Requests</h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-muted-foreground">No trial requests yet.</p>
      ) : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-secondary/50 text-left">
              <tr>
                <th className="px-4 py-3 text-[10px] uppercase tracking-luxe-sm">Customer</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-luxe-sm">Phone</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-luxe-sm">Area</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-luxe-sm">Slot</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-luxe-sm">Pieces</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-luxe-sm">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3">{r.customer_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.service_area || r.pincode}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.preferred_slot || "—"}</td>
                  <td className="px-4 py-3">{r.item_count}</td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                      className="bg-background border border-border px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelected(r)} className="text-muted-foreground hover:text-foreground">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-background border border-border max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-2xl">Trial request</h2>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <Detail label="Reference">{selected.id}</Detail>
              <Detail label="Customer">{selected.customer_name}</Detail>
              <Detail label="Phone">{selected.phone}</Detail>
              {selected.email && <Detail label="Email">{selected.email}</Detail>}
              <Detail label="Address">{selected.address}{selected.city ? `, ${selected.city}` : ""} — {selected.pincode}</Detail>
              {selected.latitude != null && (
                <Detail label="Location">
                  {Number(selected.latitude).toFixed(5)}, {selected.longitude != null ? Number(selected.longitude).toFixed(5) : "—"}
                </Detail>
              )}
              <Detail label="Service area">{selected.service_area || "Not in preset area"}</Detail>
              <Detail label="Preferred slot">{selected.preferred_slot || "To be arranged"}</Detail>
              <Detail label="Status">{selected.status}</Detail>
              {selected.measurements && <Detail label="Measurements">{selected.measurements}</Detail>}
              {selected.notes && <Detail label="Notes">{selected.notes}</Detail>}
              <div className="pt-3">
                <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground mb-2">Pieces requested</p>
                <div className="space-y-2">
                  {(selected.items || []).map((it, i) => (
                    <div key={i} className="flex justify-between border-b border-border/50 pb-2">
                      <span className="font-light">{it.name} <span className="text-muted-foreground">· {it.sku}</span></span>
                      <span>{formatINR(it.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, children }) {
  return (
    <div className="grid grid-cols-3 gap-4 border-b border-border/50 pb-3">
      <span className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">{label}</span>
      <span className="col-span-2 font-light break-words">{children}</span>
    </div>
  );
}
 