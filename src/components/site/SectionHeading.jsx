import { cn } from "@/lib/utils";

export function Eyebrow({ children, className = "" }) {
  return (
    <span className={cn("block text-[11px] uppercase tracking-luxe text-muted-foreground", className)}>
      {children}
    </span>
  );
}

export default function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className = "",
}) {
  const isCenter = align === "center";
  return (
    <div className={cn(isCenter ? "text-center mx-auto max-w-2xl" : "max-w-2xl", className)}>
      {eyebrow && <Eyebrow className={isCenter ? "mb-4" : "mb-4"}>{eyebrow}</Eyebrow>}
      <h2 className="font-display text-4xl md:text-5xl lg:text-[3.4rem] leading-[1.05] text-foreground">
        {title}
      </h2>
      {intro && (
        <p className={cn("mt-5 text-base md:text-lg text-muted-foreground leading-relaxed font-light", isCenter && "mx-auto")}>
          {intro}
        </p>
      )}
    </div>
  );
}