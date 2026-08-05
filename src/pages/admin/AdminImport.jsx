import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2, Download } from "lucide-react";

const FIELDS = [
  "name*", "sku*", "price*", "slug", "barcode", "short_description", "description",
  "discount_price", "collection", "category", "subcategory", "fabric", "colour",
  "border", "pattern", "occasion", "length", "blouse_included", "weight",
  "featured", "trending", "new_arrival", "active", "cover_image",
  "seo_title", "seo_description",
  "stock_quantity", "reserved", "incoming", "minimum_stock", "warehouse_location",
];

const SAMPLE_CSV = [
  ["name", "sku", "price", "collection", "fabric", "colour", "stock_quantity", "warehouse_location"],
  ["Test Saree", "VK-TEST-001", "25000", "Organza", "Organza Silk", "Blush", "5", "BAN-A1"],
].map((r) => r.join(",")).join("\n");

export default function AdminImport() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | importing | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const canImport = file && status !== "uploading" && status !== "importing";

  const handleImport = async () => {
    if (!file) return;
    setStatus("uploading");
    setError("");
    setResult(null);
    try {
      // 1. Upload the CSV file (client-side Core method).
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      // 2. Invoke the backend function to extract + create products + inventory.
      setStatus("importing");
      const res = await base44.functions.invoke("BulkImportProducts", { file_url });
      setResult(res.data);
      setStatus("done");
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Import failed");
      setStatus("error");
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "varahi-saree-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setResult(null);
    setError("");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl">Bulk Import</h1>
        <p className="text-sm text-muted-foreground mt-1 font-light">
          Upload a CSV to create sarees and their inventory in one pass.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload card */}
        <div className="lg:col-span-2">
          <div className="border border-border bg-card p-8">
            <label
              className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed cursor-pointer transition-colors duration-300 py-16 ${
                file ? "border-accent/50 bg-accent/5" : "border-border hover:border-accent/40"
              }`}
            >
              <UploadCloud className="w-10 h-10 text-muted-foreground" />
              <div className="text-center">
                {file ? (
                  <>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(file.size / 1024).toFixed(1)} KB · click to replace
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium">Click to select a CSV file</p>
                    <p className="text-xs text-muted-foreground mt-1">CSV or Excel · max 25 MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setStatus("idle");
                  setResult(null);
                  setError("");
                }}
              />
            </label>

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={handleImport}
                disabled={!canImport}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-[11px] uppercase tracking-luxe-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {status === "uploading" || status === "importing" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                {status === "uploading"
                  ? "Uploading…"
                  : status === "importing"
                  ? "Importing…"
                  : "Import Sarees"}
              </button>
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 border border-border px-6 py-3 text-[11px] uppercase tracking-luxe-sm hover:bg-secondary transition-colors"
              >
                <Download className="w-4 h-4" />
                Template
              </button>
              {(status === "done" || status === "error") && (
                <button
                  onClick={reset}
                  className="text-[11px] uppercase tracking-luxe-sm text-muted-foreground hover:text-foreground"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Result */}
            {status === "done" && result && (
              <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <p className="text-sm font-medium">Import complete</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <Stat label="Rows" value={result.total_rows} />
                  <Stat label="Products" value={result.products_created} />
                  <Stat label="Inventory" value={result.inventory_created} />
                </div>
                {result.skipped?.length > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="w-4 h-4" />
                      <p className="text-xs uppercase tracking-luxe-sm">{result.skipped.length} skipped</p>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {result.skipped.map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground">
                          Row {s.row}: {s.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {status === "error" && (
              <div className="mt-8 border border-destructive/30 bg-destructive/5 p-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <p className="text-sm font-medium">Import failed</p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Field reference */}
        <div>
          <div className="border border-border bg-card p-6 sticky top-6">
            <h3 className="text-[11px] uppercase tracking-luxe-sm text-muted-foreground mb-4">
              CSV Columns
            </h3>
            <p className="text-xs text-muted-foreground mb-4 font-light">
              <span className="text-accent">*</span> = required. Inventory fields are optional.
            </p>
            <div className="flex flex-wrap gap-2">
              {FIELDS.map((f) => (
                <span
                  key={f}
                  className="text-[10px] uppercase tracking-luxe-sm border border-border px-2 py-1"
                >
                  {f}
                </span>
              ))}
            </div>
            <p className="mt-5 text-[10px] text-muted-foreground font-light leading-relaxed">
              Booleans accept true/false, yes/no, 1/0. Use the cover_image URL column for the main product image.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="font-display text-2xl">{value}</p>
      <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}