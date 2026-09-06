import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { slugify } from "@/lib/format";

export default function AdminCollections() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: items } = useQuery({
    queryKey: ["admin-collections"],
    queryFn: () => base44.entities.Collection.list("display_order", 100),
  });

  const list = items || [];

  const remove = async (c) => {
    await base44.entities.Collection.delete(c.id);
    qc.invalidateQueries({ queryKey: ["admin-collections"] });
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-luxe text-muted-foreground">Catalogue</p>
          <h1 className="font-display text-4xl mt-2">Collections</h1>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-foreground text-background text-[11px] uppercase tracking-luxe-sm px-5 py-3">
          <Plus className="w-4 h-4" /> New Collection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((c) => (
          <div key={c.id} className="bg-background border border-border">
            {c.cover_image && <img src={c.cover_image} alt="" className="w-full h-40 object-cover" />}
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-xl">{c.name}</h3>
                  <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground mt-1">{c.active ? "Active" : "Hidden"}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(c); setShowForm(true); }} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => remove(c)} className="p-1.5 text-muted-foreground hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {c.description && <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed">{c.description}</p>}
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <p className="col-span-full py-16 text-center text-muted-foreground">No collections yet.</p>
        )}
      </div>

      {showForm && <CollectionForm item={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
}

function CollectionForm({ item, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "", slug: "", description: "", cover_image: "", display_order: 0,
    homepage_position: "middle", active: true, ...item,
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, display_order: Number(form.display_order || 0) };
      if (item) await base44.entities.Collection.update(item.id, payload);
      else await base44.entities.Collection.create({ ...payload, slug: payload.slug || slugify(payload.name) });
      qc.invalidateQueries({ queryKey: ["admin-collections"] });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4 md:p-8">
      <div className="bg-background w-full max-w-lg my-8">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-2xl">{item ? "Edit Collection" : "New Collection"}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: item ? form.slug : slugify(e.target.value) })} className="vk-admin-input" required /></Field>
          <Field label="Slug"><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="vk-admin-input" required /></Field>
          <Field label="Description"><textarea rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="vk-admin-input resize-none" /></Field>
          <Field label="Cover Image URL"><input value={form.cover_image || ""} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} className="vk-admin-input" /></Field>
          <Field label="Display Order"><input type="number" value={form.display_order || 0} onChange={(e) => setForm({ ...form, display_order: e.target.value })} className="vk-admin-input" /></Field>
          <Field label="Homepage Placement">
            <select value={form.homepage_position || "middle"} onChange={(e) => setForm({ ...form, homepage_position: e.target.value })} className="vk-admin-input">
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="low">Low</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
          <div className="flex gap-3 pt-4 border-t border-border">
            <button type="submit" disabled={saving} className="flex-1 bg-foreground text-background text-[11px] uppercase tracking-luxe-sm py-3 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} {item ? "Save" : "Create"}
            </button>
            <button type="button" onClick={onClose} className="px-6 border border-border text-[11px] uppercase tracking-luxe-sm">Cancel</button>
          </div>
        </form>
        <style>{`.vk-admin-input{width:100%;background:transparent;border:1px solid hsl(var(--border));padding:.55rem .7rem;font-size:.9rem;font-weight:300;color:hsl(var(--foreground));outline:none;margin-top:.3rem}.vk-admin-input:focus{border-color:hsl(var(--foreground))}`}</style>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">{label}</span>{children}</label>;
}