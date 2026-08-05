import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container-luxe py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <h3 className="font-display text-3xl md:text-4xl">Varahi Kauseya</h3>
            <p className="mt-4 text-sm text-muted-foreground font-light leading-relaxed max-w-sm">
              Heritage luxury sarees, handwoven by master artisans. A study in
              timeless Indian craft, made for the modern connoisseur.
            </p>
            <div className="flex items-center gap-5 mt-8">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
                <Instagram className="w-[18px] h-[18px]" />
              </a>
              <a href="mailto:atelier@varahikauseya.com" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Email">
                <Mail className="w-[18px] h-[18px]" />
              </a>
              <a href="tel:+910000000000" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Phone">
                <Phone className="w-[18px] h-[18px]" />
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="text-[11px] uppercase tracking-luxe text-muted-foreground mb-5">Explore</p>
            <ul className="space-y-3 text-sm font-light">
              <li><Link to="/collections" className="editorial-link">Collections</Link></li>
              <li><Link to="/sarees" className="editorial-link">All Sarees</Link></li>
              <li><Link to="/about" className="editorial-link">Our Heritage</Link></li>
              <li><Link to="/contact" className="editorial-link">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="text-[11px] uppercase tracking-luxe text-muted-foreground mb-5">Atelier</p>
            <p className="text-sm font-light text-muted-foreground leading-relaxed flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <span>No. 12, Heritage Lane,<br />Banaras, Uttar Pradesh, India</span>
            </p>
            <p className="text-sm font-light text-muted-foreground mt-3">
              By appointment only.
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-[11px] uppercase tracking-luxe-sm text-muted-foreground">
            © {new Date().getFullYear()} Varahi Kauseya
          </p>
          <p className="text-[11px] uppercase tracking-luxe-sm text-muted-foreground">
            Handcrafted with reverence
          </p>
        </div>
      </div>
    </footer>
  );
}