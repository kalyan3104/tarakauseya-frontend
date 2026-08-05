import { Image } from "@/components/ui/image";
import Reveal from "@/components/site/Reveal";
import SectionHeading from "@/components/site/SectionHeading";
import { MEDIA } from "@/lib/media";

const GALLERY = [
  MEDIA.bridal,
  MEDIA.organza,
  MEDIA.temple,
  MEDIA.handloom,
  MEDIA.craftsmanship,
  MEDIA.hero,
];

export default function InstagramGallery() {
  return (
    <section className="py-24 md:py-36 bg-secondary/40">
      <div className="container-luxe">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="@varahikauseya"
            title="The Gallery"
            intro="A visual diary of the atelier — the looms, the light, the finished drape."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
          {GALLERY.map((src, i) => (
            <Reveal key={i} delay={(i % 6) * 0.05}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover-zoom block aspect-square bg-muted">
                <Image src={src} alt="Gallery" className="w-full h-full" fittingType="fill" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}