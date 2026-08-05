import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/site/Reveal";
import { ArrowUpRight } from "lucide-react";

const POSTS = [
  {
    cat: "Craft",
    title: "The gold zari of Banaras, and why it cannot be rushed.",
    excerpt: "A note on the drawn-wire gold thread that gives our bridal sarees their quiet luminosity — and the three weeks it takes a single artisan to prepare it.",
    read: "6 min read",
  },
  {
    cat: "Heritage",
    title: "Temple borders, and the geometry of devotion.",
    excerpt: "Tracing the recurring peacock and the recurring rath — motifs older than the looms themselves, drawn from the stone of South Indian temples.",
    read: "5 min read",
  },
  {
    cat: "Atelier",
    title: "On choosing a saree you will keep for twenty years.",
    excerpt: "A small guide to investing in a single, considered piece — fabric, weight, drape, and the intention behind the wear.",
    read: "4 min read",
  },
  {
    cat: "Natural Dyes",
    title: "Indigo, madder, and the colour of patience.",
    excerpt: "Our dye-master on preparing mineral and vegetable dyes in small batches over wood fire, and why no two batches are ever identical.",
    read: "7 min read",
  },
  {
    cat: "Artisans",
    title: "A day with Ravindra, master weaver of thirty years.",
    excerpt: "He has woven the same bridal border since 1994. We spent a morning at his loom, and listened.",
    read: "5 min read",
  },
];

export default function Journal() {
  return (
    <>
      <PageHeader
        eyebrow="The Journal"
        title="Notes from the atelier"
        intro="Slow reading on craft, heritage, and the philosophy of the drape — written from Banaras, seasonally."
      />
      <section className="py-16 md:py-24">
        <div className="container-luxe grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {POSTS.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 0.1}>
              <article className="group cursor-pointer border-t border-border pt-8">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-luxe-sm text-accent">{p.cat}</p>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300" />
                </div>
                <h2 className="font-display text-3xl md:text-4xl mt-4 leading-snug group-hover:text-accent transition-colors duration-500">
                  {p.title}
                </h2>
                <p className="mt-5 text-muted-foreground font-light leading-relaxed">{p.excerpt}</p>
                <p className="mt-6 text-[10px] uppercase tracking-luxe-sm text-muted-foreground">{p.read}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}