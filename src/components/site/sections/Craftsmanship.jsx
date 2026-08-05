import { Image } from "@/components/ui/image";
import Reveal from "@/components/site/Reveal";
import { Eyebrow } from "@/components/site/SectionHeading";
import { MEDIA } from "@/lib/media";

const STEPS = [
  { n: "01", title: "Sourcing", text: "Mulberry silk and long-staple cotton, chosen by hand from regional cooperatives." },
  { n: "02", title: "Dyeing", text: "Natural mineral and vegetable dyes, prepared in small batches over wood fire." },
  { n: "03", title: "Weaving", text: "Each saree takes three to six weeks on the pit loom — one weaver, one piece." },
  { n: "04", title: "Finishing", text: "Hand-rolled edges, zari work and a final inspection under daylight." },
];

export default function Craftsmanship() {
  return (
    <section className="py-24 md:py-36 bg-foreground text-background">
      <div className="container-luxe">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <Reveal className="lg:col-span-5">
            <div className="relative aspect-[4/5] bg-background/10">
              <Image src={MEDIA.craftsmanship} alt="A weaver at the loom" className="w-full h-full" fittingType="fill" />
            </div>
          </Reveal>

          <div className="lg:col-span-7 lg:pl-6">
            <Reveal>
              <Eyebrow className="text-background/60">The Craft</Eyebrow>
              <h2 className="font-display text-4xl md:text-5xl mt-4 leading-[1.05] text-background">
                The slow measure of the loom.
              </h2>
              <p className="mt-6 text-base md:text-lg text-background/70 font-light leading-relaxed max-w-xl">
                Every Varahi Kauseya saree passes through four unhurried stages.
                We refuse to compress them — the hand cannot be rushed, and the
                result is worth the wait.
              </p>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.08}>
                  <div className="border-t border-background/20 pt-5">
                    <p className="font-display text-2xl text-background/50">{s.n}</p>
                    <h3 className="font-display text-xl mt-1">{s.title}</h3>
                    <p className="mt-2 text-sm text-background/60 font-light leading-relaxed">{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}