import { Link } from "react-router-dom";
import Reveal from "@/components/site/Reveal";
import SectionHeading from "@/components/site/SectionHeading";

const POSTS = [
  {
    cat: "Craft",
    title: "The gold zari of Banaras, and why it cannot be rushed.",
    excerpt: "A note on the drawn-wire gold thread that gives our bridal sarees their quiet luminosity.",
    read: "6 min read",
  },
  {
    cat: "Heritage",
    title: "Temple borders, and the geometry of devotion.",
    excerpt: "Tracing the recurring peacock and the recurring rath — motifs older than the looms themselves.",
    read: "5 min read",
  },
  {
    cat: "Atelier",
    title: "On choosing a saree you will keep for twenty years.",
    excerpt: "A small guide to investing in a single, considered piece — fabric, weight, and intention.",
    read: "4 min read",
  },
];

export default function JournalPreview() {
  return (
    <section className="py-24 md:py-36">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <Reveal>
            <SectionHeading eyebrow="The Journal" title="Notes from the atelier" />
          </Reveal>
          <Reveal delay={0.1}>
            <Link to="/journal" className="editorial-link text-[11px] uppercase tracking-luxe-sm">
              All notes
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {POSTS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <article className="group cursor-pointer border-t border-border pt-6">
                <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">{p.cat}</p>
                <h3 className="font-display text-2xl md:text-[1.7rem] mt-3 leading-snug group-hover:text-accent transition-colors duration-500">
                  {p.title}
                </h3>
                <p className="mt-4 text-sm text-muted-foreground font-light leading-relaxed">{p.excerpt}</p>
                <p className="mt-5 text-[10px] uppercase tracking-luxe-sm text-muted-foreground">{p.read}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}