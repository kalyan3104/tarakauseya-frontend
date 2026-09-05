import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { formatINR } from "@/lib/format";
import { Image } from "@/components/ui/image";
import PageHeader from "@/components/site/PageHeader";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Loader2 } from "lucide-react";

const inputCls =
  "w-full bg-background border border-border px-4 py-3 text-sm font-light focus:outline-none focus:border-foreground transition-colors";

export default function Checkout() {
  const { items, clear } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    preferred_slot: "",
    notes: "",
    measurements: "",
  });
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  const { data: areas } = useQuery({
    queryKey: ["service-areas"],
    queryFn: () => base44.entities.ServiceArea.filter({ active: true }),
  });

  const matchedArea = useMemo(() => {
    if (!areas || !form.pincode) return null;
    const pin = form.pincode.trim();
    return (
      areas.find((a) =>
        (a.pincodes || []).some((p) => {
          const pc = String(p).trim();
          return pin === pc || (pc.length >= 3 && pin.startsWith(pc));
        })
      ) || null
    );
  }, [areas, form.pincode]);

  const total = items.reduce((s, i) => s + (Number(i.price) || 0), 0);
  const normalizedCity = (form.city || "").trim();
  const normalizedPincode = (form.pincode || "").trim();
  const isLikelyBengaluruPincode = (value) => {
    if (!value) return false;
    const digits = value.replace(/\D/g, "");
    if (digits.length < 3) return false;
    const prefixes = ["560", "561", "562", "563", "564", "565", "566", "567", "568", "569", "570", "571", "572", "573", "574", "575", "576", "577", "578", "579"];
    return prefixes.some((prefix) => digits.startsWith(prefix));
  };
  const isBengaluru = /(bangalore|banglore|bengaluru)/i.test(`${normalizedCity} ${matchedArea?.name || ""} ${matchedArea?.city || ""}`) || isLikelyBengaluruPincode(normalizedPincode);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const fetchLocation = () => {
    setLocating(true);
    setError("");

    const isSecureContext = window.isSecureContext || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!isSecureContext) {
      setError("Location access requires a secure page or localhost. Please allow location access or enter your address manually.");
      setLocating(false);
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Please enter your address manually.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        const message = err.code === 1
          ? "Location permission was denied. Please allow access in your browser and try again, or enter your address manually."
          : err.code === 2
            ? "Location is currently unavailable. Please try again or enter your address manually."
            : "Could not fetch your location. Please try again or enter your address manually.";
        setError(message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.phone || !form.address || !form.pincode) return;
    if (!isBengaluru) {
      setError("Home trials are currently available only in Bengaluru.");
      return;
    }
    if (!isAuthenticated || !user?.id) {
      setError("Please sign in before placing an order so it can appear in My Orders.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        customer_id: user.id,
        customer_name: form.customer_name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: form.city,
        pincode: form.pincode,
        latitude: coords?.lat,
        longitude: coords?.lng,
        service_area: matchedArea?.name || "",
        preferred_slot: form.preferred_slot,
        notes: form.notes,
        measurements: form.measurements,
        items: items.map((i) => ({
          product_id: i.id,
          name: i.name,
          sku: i.sku,
          price: i.price,
          image: i.image,
          collection: i.collection,
        })),
        item_count: items.length,
        status: "requested",
      };
      const created = await base44.entities.TrialRequest.create(payload);
      setDone(created);
      clear();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !done) {
    return (
      <div className="pt-40 pb-32 container-luxe text-center">
        <p className="font-display text-4xl">Your cart is empty</p>
        <Link to="/sarees" className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-luxe-sm editorial-link">
          <ArrowLeft className="w-3.5 h-3.5" /> Browse the collection
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="pt-32 md:pt-40 pb-32 container-luxe text-center max-w-2xl mx-auto">
        <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
        <h1 className="font-display text-4xl md:text-5xl mt-6">Request received</h1>
        <p className="mt-5 text-muted-foreground font-light leading-relaxed">
          Thank you, {done.customer_name}. Our atelier will confirm your Delivery visit
          {done.preferred_slot ? <> for <span className="text-foreground">{done.preferred_slot}</span></> : " in your area"} shortly.
          We'll contact you on <span className="text-foreground">{done.phone}</span> to finalise.
        </p>
        <div className="mt-8 border border-border p-6 text-left">
          <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">Reference</p>
          <p className="font-mono text-sm mt-1 break-all">{done.id}</p>
          <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground mt-4">Pieces requested</p>
          <p className="text-sm mt-1">{done.item_count}</p>
        </div>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-luxe-sm editorial-link">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-32 pb-24">
      <div className="container-luxe">
        <PageHeader
          eyebrow="Two Days Delivery · Bengaluru"
          title="Two Days Delivery"
          intro="Share your delivery details, and we’ll bring your chosen saree straight to your doorstep. Pay when it arrives and collect it with ease. A simple, convenient way to shop your favourite sarees from the comfort of your home."
        />

        <form onSubmit={handleSubmit} className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          <div className="lg:col-span-2 space-y-10">
            {/* Contact */}
            <section>
              <h2 className="font-display text-2xl mb-5">Your details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full name *">
                  <input className={inputCls} value={form.customer_name} onChange={set("customer_name")} required />
                </Field>
                <Field label="Phone *">
                  <input className={inputCls} value={form.phone} onChange={set("phone")} required type="tel" />
                </Field>
                <Field label="Email (optional)">
                  <input className={inputCls} value={form.email} onChange={set("email")} type="email" />
                </Field>
              </div>
            </section>

            {/* Address + location */}
            <section>
              <h2 className="font-display text-2xl mb-5">Where shall we bring them?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Address *" className="sm:col-span-2">
                  <textarea className={inputCls + " min-h-[80px]"} value={form.address} onChange={set("address")} required />
                </Field>
                <Field label="City">
                  <input className={inputCls} value={form.city} onChange={set("city")} />
                </Field>
                <Field label="Pincode *">
                  <input className={inputCls} value={form.pincode} onChange={set("pincode")} required inputMode="numeric" />
                </Field>
              </div>

              <div className="mt-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <button
                    type="button"
                    onClick={fetchLocation}
                    className="inline-flex items-center gap-2 text-[11px] uppercase tracking-luxe-sm border border-foreground/30 px-5 py-3 hover:bg-foreground hover:text-background transition-colors"
                  >
                    {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    {locating ? "Locating…" : "Use my location"}
                  </button>
                  {!coords && (
                    <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">
                      Enable location in your browser or enter the address manually
                    </p>
                  )}
                </div>
                {coords && (
                  <p className="mt-3 text-xs text-muted-foreground font-light">
                    Location captured: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </p>
                )}
                {error && <p className="mt-3 text-xs text-destructive font-light">{error}</p>}
                {coords && (
                  <div className="mt-4 h-56 border border-border overflow-hidden">
                    <MapContainer center={[coords.lat, coords.lng]} zoom={14} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                      <CircleMarker
                        center={[coords.lat, coords.lng]}
                        radius={10}
                        pathOptions={{ color: "#b45309", fillColor: "#b45309", fillOpacity: 0.6 }}
                      >
                        <Tooltip>Your location</Tooltip>
                      </CircleMarker>
                    </MapContainer>
                  </div>
                )}
              </div>

              {/* Slots */}
              <div className="mt-6">
                <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">Available slots in your area</p>
                {form.pincode ? (
                  matchedArea ? (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground font-light mb-3">
                        Service area: {matchedArea.name}{matchedArea.city ? `, ${matchedArea.city}` : ""}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(matchedArea.slots || []).map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, preferred_slot: slot }))}
                            className={
                              (form.preferred_slot === slot
                                ? "border-foreground bg-foreground text-background"
                                : "border-border hover:border-foreground") +
                              " px-4 py-2 text-xs transition-colors"
                            }
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                      {form.preferred_slot && <p className="mt-3 text-xs text-foreground font-light">Selected: {form.preferred_slot}</p>}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground font-light">
                      We connect with you - {form.pincode}. - Our atelier will contact you to arrange a suitable time.
                    </p>
                  )
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground font-light">Enter your pincode to see available slots.</p>
                )}
              </div>
            </section>

            {/* Notes */}
            <section>
              <h2 className="font-display text-2xl mb-5">Preferences</h2>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Notes (optional)" hint="Special requests, colour preferences, or occasion details">
                  <textarea className={inputCls + " min-h-[80px]"} value={form.notes} onChange={set("notes")} />
                </Field>
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-28 h-fit border border-border p-6 bg-card">
            <h2 className="font-display text-2xl">Your selection</h2>
            <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground mt-1">
              {items.length} {items.length === 1 ? "piece" : "pieces"}
            </p>
            <div className="mt-5 space-y-4 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 aspect-[3/4] bg-muted overflow-hidden flex-shrink-0">
                    {item.image && <Image src={item.image} alt={item.name} className="w-full h-full" fittingType="fill" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatINR(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-border flex justify-between">
              <span className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">Indicative total</span>
              <span className="font-display text-xl">{formatINR(total)}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground font-light leading-relaxed">
              No payment is collected now. You pay only for the pieces you keep, at the time of trial.
            </p>
            {isBengaluru && <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-4 text-[11px] uppercase tracking-luxe-sm disabled:opacity-50 hover:bg-accent transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Place Order <ArrowRight className="w-4 h-4" /></>}
            </button>}
            {!isBengaluru && <p className="mt-6 text-xs text-muted-foreground"> Enter a Bengaluru/Bangalore address or a valid Bangalore PIN code to make the “Place Order” button available. Orders are delivered within 2 days.</p>}
          </aside>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children, hint, className = "" }) {
  return (
    <label className={"block " + className}>
      <span className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="text-[10px] text-muted-foreground/70 font-light mt-1 block">{hint}</span>}
    </label>
  );
}
