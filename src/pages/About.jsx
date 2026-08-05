import { Image } from "@/components/ui/image";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/site/Reveal";
import { Eyebrow } from "@/components/site/SectionHeading";
import { MEDIA } from "@/lib/media";

const TIMELINE = [
  { year: "1947", title: "The first loom", text: "Our founder inherits a single pit loom in Banaras and begins weaving for the family." },
  { year: "1968", title: "The atelier opens", text: "A small workshop on Heritage Lane, three weavers, and the first bridal commission." },
  { year: "1992", title: "Natural dyes", text: "We commit entirely to mineral and vegetable dyes, prepared in small batches." },
  { year: "2010", title: "The second generation", text: "Expansion into organza and handloom cotton, with new artisan partnerships." },
  { year: "Today", title: "Varahi Kauseya", text: "Forty master artisans, a single philosophy — nothing is hurried." },
];

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="Our Heritage"
        title="Woven slowly,\nkept for life."
        intro="Varahi Kauseya is a house of heritage luxury sarees, founded in Banaras and devoted to the unhurried craft of the handloom."
      />

      <section className="py-16 md:py-24">
        <div className="container-luxe grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <div className="aspect-[4/5] bg-muted">
              <Image src={MEDIA.atelier} alt="The atelier" className="w-full h-full" fittingType="fill" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Eyebrow>Mission</Eyebrow>
            <h2 className="font-display text-3xl md:text-4xl mt-4 leading-tight">
              To preserve the hand, and the time it deserves.
            </h2>
            <p className="mt-5 text-muted-foreground font-light leading-relaxed">
              We exist to keep the handloom alive — not as nostalgia, but as a living, evolving craft. Every saree we make is woven by a single artisan, signed by their hand, and built to outlast trends by decades.
            </p>
            <p className="mt-4 text-muted-foreground font-light leading-relaxed">
              We pay our weavers above market, share profits on each piece, and refuse to compress what takes weeks into days. This is not a brand. It is an inheritance.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24 bg-secondary/40">
        <div className="container-luxe">
          <Reveal>
            <Eyebrow className="mb-4">Our Journey</Eyebrow>
            <h2 className="font-display text-4xl md:text-5xl">A timeline</h2>
          </Reveal>
          <div className="mt-14">
            {TIMELINE.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.05}>
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 md:gap-12 py-8 border-t border-border">
                  <p className="font-display text-3xl md:text-4xl text-accent">{t.year}</p>
                  <div>
                    <h3 className="font-display text-2xl">{t.title}</h3>
                    <p className="mt-2 text-muted-foreground font-light leading-relaxed max-w-2xl">{t.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Artisans */}
      <section className="py-16 md:py-24">
        <div className="container-luxe grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal className="lg:order-2">
            <div className="aspect-[4/5] bg-muted">
              <Image src={MEDIA.craftsmanship} alt="Our artisans" className="w-full h-full" fittingType="fill" />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="lg:order-1">
            <Eyebrow>The Artisans</Eyebrow>
            <h2 className="font-display text-3xl md:text-4xl mt-4 leading-tight">
              Forty hands, one philosophy.
            </h2>
            <p className="mt-5 text-muted-foreground font-light leading-relaxed">
              Our weavers are not employees — they are partners. Many learned the craft from their fathers, who learned it from theirs. We work with families across Banaras, Bhagalpur and Chanderi, each specialising in a regional technique.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {[{ n: "40+", l: "Artisans" }, { n: "3", l: "Regions" }, { n: "70yr", l: "Avg. lineage" }].map((s) => (
                <div key={s.l}>
                  <p className="font-display text-3xl">{s.n}</p>
                  <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground mt-2">{s.l}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}