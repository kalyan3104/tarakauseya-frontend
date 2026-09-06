import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/site/Reveal";
import { MEDIA } from "@/lib/media";

const FALLBACK = [
  { name: "Bridal", slug: "bridal", desc: "Ceremonial Banarasi, woven in gold.", image: MEDIA.bridal },
  { name: "Wedding", slug: "wedding", desc: "For the vows and the quiet moments between.", image: MEDIA.temple },
  { name: "Temple", slug: "temple", desc: "Heritage borders, regal motifs.", image: MEDIA.temple },
  { name: "Silk", slug: "silk", desc: "Pure mulberry, luminous and enduring.", image: MEDIA.bridal },
  { name: "Cotton", slug: "cotton", desc: "Light, breathable, everyday grace.", image: MEDIA.handloom },
  { name: "Organza", slug: "organza", desc: "Light, ethereal, modern.", image: MEDIA.organza },
  { name: "Handloom", slug: "handloom", desc: "Grounded cotton, undyed calm.", image: MEDIA.handloom },
  { name: "Luxury", slug: "luxury", desc: "The rarest weaves, reserved for the few.", image: MEDIA.craftsmanship },
];

const positionRank = (position) => {
  if (position === "top") return 0;
  if (position === "low") return 2;
  return 1;
};

export default function Collections() {
  const { data } = useQuery({
    queryKey: ["collections-list"],
    queryFn: () => base44.entities.Collection.filter({ active: true }, "display_order", 100),
  });

  const items = data && data.length
    ? [...data].sort((a, b) => {
        const positionDifference = positionRank(a.homepage_position) - positionRank(b.homepage_position);
        if (positionDifference !== 0) return positionDifference;
        return Number(a.display_order || 0) - Number(b.display_order || 0);
      })
    : FALLBACK;

  return (
    <>
      <PageHeader
        eyebrow="Curated Edits"
        title="Collections"
        intro="Each collection is a philosophy of the drape — a conversation between thread, region and the hand that wove it."
      />
      <section className="py-16 md:py-24">
        <div className="container-luxe grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {items.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 2) * 0.1}>
              <Link to={`/sarees?collection=${c.slug}`} className="group block">
                <div className="hover-zoom aspect-[16/11] bg-muted relative">
                  <Image
                    src={c.cover_image || c.image}
                    alt={c.name}
                    className="w-full h-full"
                    fittingType="fill"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8 md:p-10">
                    <h3 className="font-display text-3xl md:text-4xl text-white">{c.name}</h3>
                    <p className="mt-2 text-sm text-white/80 font-light max-w-xs">{c.desc || c.description}</p>
                    <span className="mt-4 inline-block text-[10px] uppercase tracking-luxe-sm text-white border-b border-white/60 pb-1">
                      Explore
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}