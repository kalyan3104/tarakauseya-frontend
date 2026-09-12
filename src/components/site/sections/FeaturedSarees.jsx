import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import Reveal from "@/components/site/Reveal";
import SectionHeading from "@/components/site/SectionHeading";
import ProductCard from "@/components/site/ProductCard";

function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-[3/4] skeleton" />
      <div className="mt-5 h-3 w-1/3 skeleton" />
      <div className="mt-3 h-4 w-2/3 skeleton" />
      <div className="mt-3 h-4 w-1/4 skeleton" />
    </div>
  );
}

const positionRank = (position) => {
  if (position === "top") return 0;
  if (position === "low") return 2;
  return 1;
};

export default function FeaturedSarees() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-sarees"],
    queryFn: () => base44.entities.Product.filter({ featured: true, active: true }, "-created_date", 100),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["featured-saree-ratings"],
    queryFn: () => base44.entities.Review.filter({}, "-created_date", 1000),
  });

  const ratings = useMemo(() => reviews.reduce((summary, review) => {
    if (!review.product_id || !review.rating) return summary;
    const current = summary[review.product_id] || { total: 0, count: 0 };
    current.total += Number(review.rating);
    current.count += 1;
    summary[review.product_id] = current;
    return summary;
  }, {}), [reviews]);

  const products = [...(data || [])]
    .sort((a, b) => {
      const positionDifference = positionRank(a.homepage_position) - positionRank(b.homepage_position);
      if (positionDifference !== 0) return positionDifference;
      return String(b.created_date || "").localeCompare(String(a.created_date || ""));
    })
    .slice(0, 4);

  return (
    <section className="py-24 md:py-36 bg-secondary/40">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <Reveal>
            <SectionHeading
              eyebrow="The Edit"
              title="Featured Sarees"
              intro="A considered selection — pieces that speak softly of craft and intent."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <Link to="/sarees" className="editorial-link text-[11px] uppercase tracking-luxe-sm">
              View all sarees
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 md:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 0.08}>
                  <ProductCard
                    product={p}
                    index={i}
                    rating={ratings[p.id] && {
                      average: ratings[p.id].total / ratings[p.id].count,
                      count: ratings[p.id].count,
                    }}
                  />
                </Reveal>
              ))}
        </div>

        {!isLoading && products.length === 0 && (
          <p className="mt-16 text-center text-muted-foreground font-light">
            New pieces are being woven. Please return soon.
          </p>
        )}
      </div>
    </section>
  );
}