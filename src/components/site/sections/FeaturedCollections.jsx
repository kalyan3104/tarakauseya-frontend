import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import Reveal from "@/components/site/Reveal";
import SectionHeading from "@/components/site/SectionHeading";
import { MEDIA } from "@/lib/media";

const COLLECTIONS = [
  { name: "Bridal", desc: "Ceremonial Banarasi, woven in gold.", image: MEDIA.bridal, slug: "bridal" },
  { name: "Organza", desc: "Light, ethereal, modern.", image: MEDIA.organza, slug: "organza" },
  { name: "Temple", desc: "Heritage borders, regal motifs.", image: MEDIA.temple, slug: "temple" },
  { name: "Handloom", desc: "Grounded cotton, undyed calm.", image: MEDIA.handloom, slug: "handloom" },
];

export default function FeaturedCollections() {
  return (
    <section className="py-24 md:py-36">
      <div className="container-luxe">
        <Reveal>
          <SectionHeading
            eyebrow="Curated Edits"
            title="Collections"
            intro="Four philosophies of the drape — each a conversation between thread, region and the hand that wove it."
          />
        </Reveal>

        <div className="mt-14 md:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.08}>
              <Link to={`/sarees?collection=${c.slug}`} className="group block">
                <div className="hover-zoom aspect-[3/4] bg-muted">
                  <Image src={c.image} alt={c.name} className="w-full h-full" fittingType="fill" />
                </div>
                <div className="mt-5">
                  <h3 className="font-display text-2xl">{c.name}</h3>
                  <p className="text-sm text-muted-foreground font-light mt-1.5">{c.desc}</p>
                  <span className="mt-3 inline-block text-[10px] uppercase tracking-luxe-sm editorial-link">
                    Discover
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}