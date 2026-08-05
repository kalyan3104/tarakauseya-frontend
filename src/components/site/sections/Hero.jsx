import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { MEDIA } from "@/lib/media";

export default function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <Image src={MEDIA.hero} alt="Varahi Kauseya heritage saree" className="w-full h-full" fittingType="fill" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent" />

      <div className="relative h-full container-luxe flex flex-col justify-end pb-20 md:pb-28">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-[11px] uppercase tracking-luxe text-white/80 mb-5"
        >
          Banaras · Est. with reverence
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-white text-5xl md:text-7xl lg:text-[5.6rem] leading-[1.02] max-w-3xl"
        >
          The art of the<br />handwoven drape.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="mt-6 text-white/85 text-base md:text-lg font-light max-w-md leading-relaxed"
        >
          Heritage silk, organza and handloom — each saree a quiet
          inheritance, woven by hand over weeks.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.35 }}
          className="mt-9 flex items-center gap-5"
        >
          <Link
            to="/collections"
            className="text-[11px] uppercase tracking-luxe-sm bg-white text-black px-7 py-3.5 hover:bg-white/85 transition-colors duration-300"
          >
            Explore Collections
          </Link>
          <Link to="/sarees" className="editorial-link text-[11px] uppercase tracking-luxe-sm text-white">
            View Sarees
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] uppercase tracking-luxe text-white/60">Scroll</span>
        <span className="w-px h-10 bg-white/40 origin-top animate-pulse" />
      </motion.div>
    </section>
  );
}