import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { formatINR } from "@/lib/format";
import Reveal from "@/components/site/Reveal";
import ProductCard from "@/components/site/ProductCard";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Minus, ShoppingBag, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/CartContext";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [openSpec, setOpenSpec] = useState(null);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => base44.entities.Product.filter({ slug }, "-created_date", 1).then((r) => r[0]),
  });

  const { data: related } = useQuery({
    queryKey: ["related", product?.collection],
    queryFn: () => base44.entities.Product.filter({ active: true, collection: product.collection }, "-created_date", 5),
    enabled: !!product?.collection,
  });

  if (isLoading) {
    return (
      <div className="pt-32 container-luxe grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-[3/4] skeleton" />
        <div className="space-y-4"><div className="h-10 w-2/3 skeleton" /><div className="h-6 w-1/3 skeleton" /><div className="h-24 skeleton" /></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-40 pb-32 container-luxe text-center">
        <p className="font-display text-4xl">Piece not found</p>
        <button onClick={() => navigate("/sarees")} className="mt-6 editorial-link text-[11px] uppercase tracking-luxe-sm">
          Back to sarees
        </button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.cover_image].filter(Boolean);
  const price = product.discount_price && product.discount_price < product.price
    ? product.discount_price : product.price;

  const specs = [
    { label: "Fabric", value: product.fabric },
    { label: "Colour", value: product.colour },
    { label: "Border", value: product.border },
    { label: "Pattern", value: product.pattern },
    { label: "Occasion", value: product.occasion },
    { label: "Length", value: product.length },
    { label: "Blouse Included", value: product.blouse_included ? "Yes" : "No" },
    { label: "Weight", value: product.weight ? `${product.weight} g` : "" },
    { label: "Collection", value: product.collection },
    { label: "SKU", value: product.sku },
  ].filter((s) => s.value);

  const accordions = [
    { title: "The Craft", body: product.description || "Each piece is woven by a single artisan on a traditional pit loom over several weeks, using natural fibres and motifs drawn from regional heritage." },
    { title: "Care Guide", body: "Dry clean only by a trusted specialist. Store wrapped in muslin, away from direct sunlight. Avoid contact with perfume and water. Air gently before storing." },
    { title: "Shipping & Handling", body: "Each saree is inspected, hand-folded and dispatched in archival packaging. Please allow 2–3 business days for dispatch. Made-to-order pieces require 4–6 weeks." },
  ];

  const enquirySubject = encodeURIComponent(`Enquiry: ${product.name}`);

  return (
    <div className="pt-24 md:pt-28">
      <div className="container-luxe">
        <Link to="/sarees" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-luxe-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> All Sarees
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery */}
          <div>
            <div className="aspect-[3/4] bg-muted overflow-hidden">
              {images[activeImg] && (
                <Image src={images[activeImg]} alt={product.name} className="w-full h-full" fittingType="fit" />
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn("aspect-[3/4] bg-muted overflow-hidden border", i === activeImg ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100")}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full" fittingType="fit" />
                  </button>
                ))}
              </div>
            )}
            {images.length > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)} className="text-[11px] uppercase tracking-luxe-sm flex items-center gap-2 editorial-link">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="text-[11px] text-muted-foreground">{activeImg + 1} / {images.length}</span>
                <button onClick={() => setActiveImg((i) => (i + 1) % images.length)} className="text-[11px] uppercase tracking-luxe-sm flex items-center gap-2 editorial-link">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:py-4">
            <p className="text-[11px] uppercase tracking-luxe text-muted-foreground">
              {product.collection} {product.fabric ? `· ${product.fabric}` : ""}
            </p>
            <h1 className="font-display text-4xl md:text-5xl mt-3 leading-[1.05]">{product.name}</h1>
            <p className="mt-4 text-sm text-muted-foreground font-light">{product.short_description}</p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl">{formatINR(price)}</span>
              {product.discount_price && product.discount_price < product.price && (
                <span className="text-muted-foreground line-through text-lg font-light">{formatINR(product.price)}</span>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {product.trending && <Tag>Trending</Tag>}
              {product.new_arrival && <Tag>New Arrival</Tag>}
              {product.featured && <Tag>Featured</Tag>}
              {product.blouse_included && <Tag>Blouse Included</Tag>}
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => { addItem(product); setAdded(true); setTimeout(() => setAdded(false), 2000); }}
                className="w-full text-[11px] uppercase tracking-luxe-sm bg-foreground text-background px-7 py-4 hover:bg-accent transition-colors duration-300 flex items-center justify-center gap-2"
              >
                {added ? <><Check className="w-4 h-4" /> Added to cart</> : <><ShoppingBag className="w-4 h-4" /> Add to cart</>}
              </button>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center text-[11px] uppercase tracking-luxe-sm border border-foreground px-7 py-4 hover:bg-foreground hover:text-background transition-colors duration-300"
                >
                  Enquire on Instagram
                </a>
                <a
                  href={`mailto:atelier@varahikauseya.com?subject=${enquirySubject}`}
                  className="flex-1 text-center text-[11px] uppercase tracking-luxe-sm border border-foreground px-7 py-4 hover:bg-foreground hover:text-background transition-colors duration-300"
                >
                  Email Atelier
                </a>
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground font-light leading-relaxed">
              This is a catalogue piece. Each saree is made to order; pricing and availability are confirmed on enquiry.
            </p>

            {/* Spec table */}
            <div className="mt-10 border-t border-border">
              <dl className="grid grid-cols-2 gap-x-6">
                {specs.map((s) => (
                  <div key={s.label} className="py-3 border-b border-border/60">
                    <dt className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">{s.label}</dt>
                    <dd className="text-sm font-light mt-0.5">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Accordions */}
            <div className="mt-8">
              {accordions.map((a) => (
                <div key={a.title} className="border-b border-border">
                  <button
                    onClick={() => setOpenSpec(openSpec === a.title ? null : a.title)}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-sm uppercase tracking-luxe-sm">{a.title}</span>
                    {openSpec === a.title ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                  {openSpec === a.title && (
                    <p className="pb-5 text-sm text-muted-foreground font-light leading-relaxed">{a.body}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related && related.filter((p) => p.id !== product.id).length > 0 && (
          <section className="mt-24 md:mt-32 pt-12 border-t border-border">
            <h2 className="font-display text-3xl md:text-4xl mb-10">You may also consider</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12">
              {related.filter((p) => p.id !== product.id).slice(0, 4).map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}><ProductCard product={p} /></Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Tag({ children }) {
  return <span className="text-[10px] uppercase tracking-luxe-sm border border-border px-3 py-1.5">{children}</span>;
}