import { Link } from "react-router-dom";
import { useCart } from "@/lib/CartContext";
import { Image } from "@/components/ui/image";
import { formatINR } from "@/lib/format";
import PageHeader from "@/components/site/PageHeader";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

export default function Cart() {
  const { items, removeItem } = useCart();
  const total = items.reduce((s, i) => s + (Number(i.price) || 0), 0);

  return (
    <div className="pt-28 md:pt-32 pb-24">
      <div className="container-luxe">
        <PageHeader
          eyebrow="Selection"
          title="Your Cart"
          intro="Pieces shortlisted for a home trial. We carry them to your doorstep — view and feel them in person, and keep only what you love."
        />

        {items.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground font-light">Your cart is empty.</p>
            <Link to="/sarees" className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-luxe-sm editorial-link">
              <ArrowLeft className="w-3.5 h-3.5" /> Browse the collection
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-12 divide-y divide-border border-t border-b border-border">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6 py-6">
                  <Link to={`/saree/${item.slug}`} className="w-24 md:w-28 aspect-[3/4] bg-muted overflow-hidden flex-shrink-0">
                    {item.image && <Image src={item.image} alt={item.name} className="w-full h-full" fittingType="fill" />}
                  </Link>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">{item.collection}</p>
                      <Link to={`/saree/${item.slug}`} className="font-display text-xl md:text-2xl mt-1 block hover:underline truncate">{item.name}</Link>
                      <p className="text-xs text-muted-foreground mt-1">SKU {item.sku}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-display text-xl">{formatINR(item.price)}</span>
                      <button onClick={() => removeItem(item.id)} className="text-[11px] uppercase tracking-luxe-sm text-muted-foreground hover:text-destructive flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-light">{items.length} {items.length === 1 ? "piece" : "pieces"} selected</p>
              <p className="font-display text-2xl">{formatINR(total)}</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground font-light">Choose a Bengaluru home trial, or place a cash-on-delivery order for delivery.</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/checkout" className="inline-flex items-center gap-3 border border-foreground px-8 py-4 text-[11px] uppercase tracking-luxe-sm hover:bg-foreground hover:text-background transition-colors">
                Delivery With 2 Days in bengaluru ( other cities coming soon). <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/payment" className="inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-luxe-sm hover:bg-accent transition-colors">
                Place order <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}