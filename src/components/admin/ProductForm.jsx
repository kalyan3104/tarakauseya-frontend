import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { X, Upload, Loader2 } from "lucide-react";
import { slugify } from "@/lib/format";
import { cn } from "@/lib/utils";

const FIELDS = [
  { key: "name", label: "Product Name", type: "text", required: true },
  { key: "slug", label: "Slug", type: "text", required: true, hint: "URL key" },
  { key: "sku", label: "SKU", type: "text", required: true },
  { key: "barcode", label: "Barcode", type: "text" },
  { key: "short_description", label: "Short Description", type: "text" },
  { key: "price", label: "Price (₹)", type: "number", required: true },
  { key: "discount_price", label: "Discount Price (₹)", type: "number" },
  { key: "collection", label: "Collection", type: "text" },
  { key: "category", label: "Category", type: "text" },
  { key: "subcategory", label: "Subcategory", type: "text" },
  { key: "fabric", label: "Fabric", type: "text" },
  { key: "colour", label: "Colour", type: "text" },
  { key: "border", label: "Border", type: "text" },
  { key: "pattern", label: "Pattern", type: "text" },
  { key: "occasion", label: "Occasion", type: "text" },
  { key: "length", label: "Length", type: "text" },
  { key: "weight", label: "Weight (g)", type: "number" },
  { key: "seo_title", label: "SEO Title", type: "text" },
  { key: "seo_description", label: "SEO Description", type: "text" },
];

const TOGGLES = [
  { key: "blouse_included", label: "Blouse Included" },
  { key: "featured", label: "Featured" },
  { key: "trending", label: "Trending" },
  { key: "new_arrival", label: "New Arrival" },
  { key: "active", label: "Active" },
  { key: "out_of_stock", label: "Out of Stock" },
];

const TEXTAREA = ["description"];

export default function ProductForm({ product, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(() => ({
    name: "", slug: "", sku: "", barcode: "", description: "", short_description: "",
    price: "", discount_price: "", collection: "", category: "", subcategory: "",
    fabric: "", colour: "", border: "", pattern: "", occasion: "", length: "",
    blouse_included: false, weight: "", featured: false, trending: false,
    new_arrival: true, active: true, seo_title: "", seo_description: "",
    out_of_stock: false,
    images: [], cover_image: "",
    ...product,
  }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const isEdit = !!product;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const onNameChange = (val) => {
    set("name", val);
    if (!isEdit) set("slug", slugify(val));
  };

  const handleUpload = async (files) => {
    if (!files.length) return;
    setUploadError("");
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        urls.push(file_url);
      }
      const next = [...(form.images || []), ...urls];
      set("images", next);
      if (!form.cover_image) set("cover_image", urls[0]);
    } catch (error) {
      setUploadError(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    const next = form.images.filter((_, i) => i !== idx);
    set("images", next);
    if (form.cover_image === form.images[idx]) set("cover_image", next[0] || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.price) payload.price = Number(payload.price);
      if (payload.discount_price) payload.discount_price = Number(payload.discount_price);
      if (payload.weight) payload.weight = Number(payload.weight);
      let savedProduct;
      if (isEdit) {
        savedProduct = await base44.entities.Product.update(product.id, payload);
      } else {
        savedProduct = await base44.entities.Product.create(payload);
      }

      const inventory = await base44.entities.Inventory.filter({ product_id: savedProduct.id });
      if (!inventory.length) {
        await base44.entities.Inventory.create({
          product_id: savedProduct.id,
          sku: savedProduct.sku || payload.sku,
          stock_quantity: 0,
          reserved: 0,
          incoming: 0,
          minimum_stock: 0,
          warehouse_location: "",
        });
      }
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["admin-inventory"] });
      qc.invalidateQueries({ queryKey: ["sarees"] });
      qc.invalidateQueries({ queryKey: ["featured-sarees"] });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4 md:p-8">
      <div className="bg-background w-full max-w-3xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="font-display text-2xl">{isEdit ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Images */}
          <div>
            <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground mb-3">Images</p>
            <div className="grid grid-cols-4 gap-3">
              {(form.images || []).map((img, i) => (
                <div key={i} className="relative aspect-square bg-muted group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-background/90 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                  {form.cover_image === img && (
                    <span className="absolute bottom-1 left-1 text-[8px] uppercase bg-foreground text-background px-1.5 py-0.5">Cover</span>
                  )}
                  {form.cover_image !== img && (
                    <button type="button" onClick={() => set("cover_image", img)} className="absolute bottom-1 left-1 text-[8px] uppercase bg-background/90 px-1.5 py-0.5 opacity-0 group-hover:opacity-100">
                      Set cover
                    </button>
                  )}
                </div>
              ))}
              <label className="aspect-square border border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 text-muted-foreground">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                <span className="text-[9px] mt-1">Upload</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(Array.from(e.target.files))} />
              </label>
            </div>
            {uploadError && <p className="mt-2 text-sm text-destructive">{uploadError}</p>}
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {FIELDS.map((f) => (
              <div key={f.key} className={TEXTAREA.includes(f.key) ? "md:col-span-2" : ""}>
                <label className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">{f.label}{f.required && " *"}</label>
                {TEXTAREA.includes(f.key) ? (
                  <textarea rows={4} value={form[f.key] || ""} onChange={(e) => set(f.key, e.target.value)} className="vk-admin-input resize-none" />
                ) : (
                  <input
                    type={f.type}
                    value={form[f.key] ?? ""}
                    onChange={(e) => f.key === "name" ? onNameChange(e.target.value) : set(f.key, e.target.value)}
                    className="vk-admin-input"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Toggles */}
          <div>
            <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground mb-3">Flags</p>
            <div className="flex flex-wrap gap-2">
              {TOGGLES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => set(t.key, !form[t.key])}
                  className={cn(
                    "text-[11px] uppercase tracking-luxe-sm px-4 py-2 border transition-colors",
                    form[t.key] ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button type="submit" disabled={saving} className="flex-1 bg-foreground text-background text-[11px] uppercase tracking-luxe-sm py-3.5 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Product"}
            </button>
            <button type="button" onClick={onClose} className="px-6 border border-border text-[11px] uppercase tracking-luxe-sm">Cancel</button>
          </div>
        </form>
      </div>

      <style>{`
        .vk-admin-input {
          width: 100%;
          background: transparent;
          border: 1px solid hsl(var(--border));
          padding: 0.55rem 0.7rem;
          font-size: 0.9rem;
          font-weight: 300;
          color: hsl(var(--foreground));
          outline: none;
          margin-top: 0.3rem;
          transition: border-color 0.2s ease;
        }
        .vk-admin-input:focus { border-color: hsl(var(--foreground)); }
      `}</style>
    </div>
  );
}
