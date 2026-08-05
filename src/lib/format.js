export function formatINR(value) {
  const n = Number(value || 0);
  return "₹" + n.toLocaleString("en-IN");
}

export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function stockStatus(item) {
  if (!item) return "unknown";
  const qty = Number(item.stock_quantity || 0);
  if (qty <= 0) return "out_of_stock";
  if (Number(item.minimum_stock || 0) > 0 && qty <= item.minimum_stock) return "low_stock";
  return "in_stock";
}
