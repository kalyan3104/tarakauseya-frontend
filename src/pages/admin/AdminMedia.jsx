import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Upload, Trash2, Loader2, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

const FOLDERS = ["general", "products", "collections", "campaigns"];

export default function AdminMedia() {
  const qc = useQueryClient();
  const [folder, setFolder] = useState("general");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const { data: items } = useQuery({
    queryKey: ["admin-media", folder],
    queryFn: () => base44.entities.MediaAsset.filter({ folder }, "-created_date", 100),
  });

  const handleUpload = async (files) => {
    if (!files.length) return;
    setUploadError("");
    setUploading(true);
    try {
      const records = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        records.push({ name: file.name, file_url, folder, mime_type: file.type, size_bytes: file.size });
      }
      await base44.entities.MediaAsset.bulkCreate(records);
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    } catch (error) {
      setUploadError(error.message || "Upload failed");
    } finally { setUploading(false); }
  };

  const remove = async (item) => {
    await base44.entities.MediaAsset.delete(item.id);
    qc.invalidateQueries({ queryKey: ["admin-media"] });
  };

  const list = items || [];

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-luxe text-muted-foreground">Assets</p>
        <h1 className="font-display text-4xl mt-2">Media Library</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
        {/* Folders */}
        <aside>
          <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground mb-3">Folders</p>
          <ul className="space-y-1">
            {FOLDERS.map((f) => (
              <li key={f}>
                <button onClick={() => setFolder(f)} className={cn("w-full flex items-center gap-2 px-3 py-2 text-sm text-left capitalize", folder === f ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary")}>
                  <Folder className="w-4 h-4" /> {f}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Grid */}
        <div>
          <label className="flex items-center gap-2 border border-dashed border-border px-4 py-3 mb-6 cursor-pointer hover:bg-secondary/50 text-sm text-muted-foreground w-fit">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload to {folder}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(Array.from(e.target.files))} />
          </label>
          {uploadError && <p className="mb-6 text-sm text-destructive">{uploadError}</p>}

          {list.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">No media in this folder.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {list.map((m) => (
                <div key={m.id} className="group relative aspect-square bg-muted overflow-hidden">
                  <img src={m.file_url} alt={m.alt_text || m.name} className="w-full h-full object-cover" />
                  <button onClick={() => remove(m)} className="absolute top-2 right-2 bg-background/90 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
