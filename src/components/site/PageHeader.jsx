import { motion } from "framer-motion";

export default function PageHeader({ eyebrow, title, intro }) {
  return (
    <section className="pt-32 md:pt-44 pb-12 md:pb-16 border-b border-border">
      <div className="container-luxe">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="block text-[11px] uppercase tracking-luxe text-muted-foreground mb-4"
        >
          {eyebrow}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl md:text-7xl leading-[1.02]"
        >
          {title}
        </motion.h1>
        {intro && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground font-light leading-relaxed"
          >
            {intro}
          </motion.p>
        )}
      </div>
    </section>
  );
}