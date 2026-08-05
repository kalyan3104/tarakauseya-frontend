import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import Reveal from "@/components/site/Reveal";
import { Eyebrow } from "@/components/site/SectionHeading";
import { MEDIA } from "@/lib/media";

export default function Heritage() {
  return (
    <section className="py-24 md:py-36">
      <div className="container-luxe grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <Reveal>
          <div className="relative aspect-[4/5] bg-muted">
            <Image src={MEDIA.atelier} alt="The Varahi Kauseya atelier" className="w-full h-full" fittingType="fill" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="lg:pl-6">
            <Eyebrow>Our Heritage</Eyebrow>
            <h2 className="font-display text-4xl md:text-5xl mt-4 leading-[1.05]">
              A quiet inheritance,<br />woven by hand.
            </h2>
            <p className="mt-6 text-base md:text-lg text-muted-foreground font-light leading-relaxed">
              Varahi Kauseya was founded on a single belief — that a saree is
              not a garment, but an archive. Each piece is woven on traditional
              pit looms in Banaras, by hands that have practiced this craft
              across generations.
            </p>
            <p className="mt-4 text-base md:text-lg text-muted-foreground font-light leading-relaxed">
              We work only with natural fibres, mineral dyes, and motifs drawn
              from temple architecture, regional folklore and the slow rhythm
              of the seasons. Nothing here is hurried.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {[
                { n: "1947", l: "First loom" },
                { n: "40+", l: "Master artisans" },
                { n: "100%", l: "Handwoven" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-display text-3xl md:text-4xl">{s.n}</p>
                  <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground mt-2">{s.l}</p>
                </div>
              ))}
            </div>
            <Link to="/about" className="mt-10 inline-block editorial-link text-[11px] uppercase tracking-luxe-sm">
              Read our story
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}