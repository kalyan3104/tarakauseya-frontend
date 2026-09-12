import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function ProductCard({ product, index = 0, rating }) {
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
          loading={index < 2 ? "eager" : "lazy"}
          fetchPriority={index < 2 ? "high" : "auto"}
          sizes="(max-width: 1023px) 50vw, 30vw"
        />
        {rating?.count > 0 && (
          <span
            className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 bg-background/95 px-1.5 py-1 text-[9px] tracking-[0.08em]"
            aria-label={`${rating.average.toFixed(1)} out of 5 stars from ${rating.count} review${rating.count === 1 ? "" : "s"}`}
          >
            <Star className="h-2.5 w-2.5 fill-amber-600 text-amber-600" aria-hidden="true" />
            <span>{rating.average.toFixed(1)}</span>
            <span className="text-muted-foreground">({rating.count})</span>
          </span>
        )}
        {product.out_of_stock && (
          <span className={`absolute right-1.5 text-[7px] uppercase tracking-[0.12em] bg-background/95 text-red-700 px-1 py-0.5 ${product.trending ? "top-7" : "top-1.5"}`}>
            Out of stock
          </span>
        )}
        {product.new_arrival && (
          <span className="absolute top-1.5 left-1.5 text-[7px] uppercase tracking-[0.12em] bg-background/90 px-1 py-0.5">
            New Arrival
          </span>
        )}
        {product.best_seller && (
          <span className={`absolute left-1.5 text-[7px] uppercase tracking-[0.12em] bg-amber-700 text-white px-1 py-0.5 ${product.new_arrival ? "top-7" : "top-1.5"}`}>
            Best Seller
          </span>
        )}
        {product.trending && (
          <span className="absolute top-1.5 right-1.5 text-[7px] uppercase tracking-[0.12em] bg-red-700 text-white px-1 py-0.5">
            Trending
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