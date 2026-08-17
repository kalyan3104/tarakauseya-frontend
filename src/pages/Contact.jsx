import { useState } from "react";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/site/Reveal";
import { Instagram, Mail, Phone, MapPin, Send } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(form.subject || `Enquiry from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:kalyan@varahikauseya.studio?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const channels = [
    { icon: Mail, label: "Email", value: "kalyan@varahikauseya.studio", href: "mailto:kalyan@varahikauseya.studio" },
    { icon: Phone, label: "WhatsApp", value: "+91 8520 824 339", href: "https://wa.me/918520824339" },
    { icon: Instagram, label: "Instagram", value: "@varahikauseya", href: "https://instagram.com" },
    { icon: MapPin, label: "Atelier", value: "No. 12, Heritage Lane, Banaras", href: "https://maps.google.com" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Contact"
        intro="For enquiries, bespoke commissions, or to visit the atelier by appointment — we would be glad to hear from you."
      />

      <section className="py-16 md:py-24">
        <div className="container-luxe grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Channels */}
          <Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {channels.map((c) => (
                <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="group border-t border-border pt-5">
                  <c.icon className="w-5 h-5 text-accent" />
                  <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground mt-4">{c.label}</p>
                  <p className="font-display text-xl mt-1.5 group-hover:text-accent transition-colors">{c.value}</p>
                </a>
              ))}
            </div>
            <div className="mt-12 p-8 bg-secondary/40">
              <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">Atelier Hours</p>
              <p className="mt-3 text-sm font-light leading-relaxed">
                Monday – Saturday, 11am – 7pm.<br />
                Visits by appointment only.
              </p>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.1}>
            {sent ? (
              <div className="border border-border p-10 text-center">
                <p className="font-display text-3xl">Thank you.</p>
                <p className="mt-3 text-muted-foreground font-light">
                  Your email client should now be open. We reply to every enquiry within two business days.
                </p>
                <button onClick={() => setSent(false)} className="mt-6 editorial-link text-[11px] uppercase tracking-luxe-sm">
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Field label="Full Name">
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="vk-input" />
                </Field>
                <Field label="Email">
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="vk-input" />
                </Field>
                <Field label="Subject">
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="vk-input" />
                </Field>
                <Field label="Message">
                  <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="vk-input resize-none" />
                </Field>
                <button type="submit" className="w-full flex items-center justify-center gap-2 text-[11px] uppercase tracking-luxe-sm bg-foreground text-background px-7 py-4 hover:bg-accent transition-colors duration-300">
                  <Send className="w-3.5 h-3.5" /> Send Enquiry
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <style>{`
        .vk-input {
          width: 100%;
          background: transparent;
          border: 0;
          border-bottom: 1px solid hsl(var(--border));
          padding: 0.6rem 0;
          font-size: 0.95rem;
          font-weight: 300;
          color: hsl(var(--foreground));
          outline: none;
          transition: border-color 0.3s ease;
        }
        .vk-input:focus { border-color: hsl(var(--foreground)); }
      `}</style>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}