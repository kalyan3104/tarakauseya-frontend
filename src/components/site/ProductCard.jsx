import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";

export default function ProductCard({ product, index = 0 }) {
  const price = product.discount_price && product.discount_price < product.price
    ? product.discount_price
    : product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;

  return (
    <Link to={`/saree/${product.slug || product.id}`} className="group block">
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        <Image
          src={product.cover_image || product.images?.[0]}
          alt={product.name}
          className="w-full h-full"
          fittingType="fill"
          loading={index < 4 ? "eager" : "lazy"}
        />
        {product.out_of_stock && (
          <span className="absolute top-4 right-4 text-[10px] uppercase tracking-luxe-sm bg-background/95 text-red-700 px-3 py-1.5">
            Out of stock
          </span>
        )}
        {product.new_arrival && (
          <span className="absolute top-4 left-4 text-[10px] uppercase tracking-luxe-sm bg-background/90 px-3 py-1.5">
            New Arrival
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <span className="inline-block text-[11px] uppercase tracking-luxe-sm bg-background px-4 py-2.5">
            {product.out_of_stock ? "View details" : "View Piece"}
          </span>
        </div>
      </div>
      <div className="mt-5">
        <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">
          {product.collection} {product.fabric ? `· ${product.fabric}` : ""}
        </p>
        <h3 className="font-display text-xl mt-1.5 leading-snug">{product.name}</h3>
        <p className="mt-2 text-sm font-light">
          {hasDiscount && (
            <span className="text-muted-foreground line-through mr-2">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          )}
          <span>₹{Number(price).toLocaleString("en-IN")}</span>
        </p>
      </div>
    </Link>
  );
}