import { useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { formatINR } from "@/lib/format";
import Reveal from "@/components/site/Reveal";
import ProductCard from "@/components/site/ProductCard";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Minus, ShoppingBag, Check, Star, ImagePlus, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_ITEM_QUANTITY, useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const REVIEW_PHOTO_MAX_BYTES = 8 * 1024 * 1024;
const REVIEW_PHOTO_MAX_EDGE = 2400;

async function prepareReviewPhoto(file) {
  if (file.size <= REVIEW_PHOTO_MAX_BYTES) return file;

  const imageUrl = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = imageUrl;
    await image.decode();
    const scale = Math.min(1, REVIEW_PHOTO_MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
    if (!blob) throw new Error("Could not prepare that photo for upload.");
    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [productImage, setProductImage] = useState(null);
  const [productZoom, setProductZoom] = useState(1);
  const [productOffset, setProductOffset] = useState({ x: 0, y: 0 });
  const productDrag = useRef(null);
  const productPointers = useRef(new Map());
  const pinchStart = useRef(null);
  const [openSpec, setOpenSpec] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const { items, addItem, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [added, setAdded] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewPhotos, setReviewPhotos] = useState([]);
  const [reviewPhoto, setReviewPhoto] = useState(null);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [reviewStatus, setReviewStatus] = useState("");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => base44.entities.Product.filter({ slug }, "-created_date", 1).then((r) => r[0]),
  });

  const { data: related } = useQuery({
    queryKey: ["related", product?.collection],
    queryFn: () => base44.entities.Product.filter({ active: true, collection: product.collection }, "-created_date", 5),
    enabled: !!product?.collection,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", product?.id],
    queryFn: () => base44.entities.Review.filter({ product_id: product.id }, "-created_date", 100),
    enabled: !!product?.id,
  });

  const reviewMutation = useMutation({
    mutationFn: () => base44.entities.Review.create({
      product_id: product.id,
      rating: reviewRating,
      body: reviewBody.trim(),
      photos: reviewPhotos.map((photo) => photo.url),
    }),
    onSuccess: () => {
      setReviewRating(0);
      setReviewBody("");
      setReviewPhotos([]);
      setReviewStatus("Thank you for sharing your experience.");
      queryClient.invalidateQueries({ queryKey: ["reviews", product.id] });
    },
    onError: (error) => setReviewStatus(error.message || "We could not submit your review."),
  });

  if (isLoading) {
    return (
      <div className="pt-32 container-luxe grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-[3/4] skeleton" />
        <div className="space-y-4"><div className="h-10 w-2/3 skeleton" /><div className="h-6 w-1/3 skeleton" /><div className="h-24 skeleton" /></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-40 pb-32 container-luxe text-center">
        <p className="font-display text-4xl">Piece not found</p>
        <button onClick={() => navigate("/sarees")} className="mt-6 editorial-link text-[11px] uppercase tracking-luxe-sm">
          Back to sarees
        </button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.cover_image].filter(Boolean);
  const price = product.discount_price && product.discount_price < product.price
    ? product.discount_price : product.price;
  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const specs = [
    { label: "Fabric", value: product.fabric },
    { label: "Colour", value: product.colour },
    { label: "Border", value: product.border },
    { label: "Pattern", value: product.pattern },
    { label: "Occasion", value: product.occasion },
    { label: "Length", value: product.length },
    { label: "Blouse Included", value: product.blouse_included ? "Yes" : "No" },
    { label: "Weight", value: product.weight ? `${product.weight} g` : "" },
    { label: "Collection", value: product.collection },
    { label: "SKU", value: product.sku },
  ].filter((s) => s.value);

  const accordions = [
    { title: "The Craft", body: product.description || "Each piece is woven by a single artisan on a traditional pit loom over several weeks, using natural fibres and motifs drawn from regional heritage." },
    { title: "Care Guide", body: "Dry clean only by a trusted specialist. Store wrapped in muslin, away from direct sunlight. Avoid contact with perfume and water. Air gently before storing." },
    { title: "Shipping & Handling", body: "Each saree is inspected, hand-folded and dispatched in archival packaging. Please allow 2–3 business days for dispatch. Made-to-order pieces require 4–6 weeks." },
  ];

  const enquirySubject = encodeURIComponent(`Enquiry: ${product.name}`);
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : 0;

  const submitReview = (event) => {
    event.preventDefault();
    if (!reviewRating || !reviewBody.trim()) {
      setReviewStatus("Choose a rating and write a short review.");
      return;
    }
    setReviewStatus("");
    reviewMutation.mutate();
  };

  const handleReviewPhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    if (reviewPhotos.length + files.length > 4) {
      setReviewStatus("You can add up to 4 photos.");
      return;
    }
    if (files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
      setReviewStatus("Photos must be JPG, PNG, or WebP images.");
      return;
    }
    setIsUploadingPhotos(true);
    setReviewStatus("");
    try {
      const uploaded = await Promise.all(files.map(async (file) => {
        const preparedFile = await prepareReviewPhoto(file);
        const result = await base44.integrations.Core.UploadFile({ file: preparedFile });
        return { url: result.file_url, name: preparedFile.name };
      }));
      setReviewPhotos((current) => [...current, ...uploaded]);
    } catch (error) {
      setReviewStatus(error.message || "We could not upload that photo.");
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const handleGalleryTouchStart = (event) => {
    setTouchStart(event.touches[0].clientX);
  };

  const handleGalleryTouchEnd = (event) => {
    if (touchStart == null) return;
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) > 45 && images.length > 1) {
      setActiveImg((current) => (distance < 0 ? (current + 1) % images.length : (current - 1 + images.length) % images.length));
    }
    setTouchStart(null);
  };

  const openProductImage = (index) => {
    setProductImage({ src: images[index], index });
    setProductZoom(1);
    setProductOffset({ x: 0, y: 0 });
  };

  const handleProductPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    productPointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (productPointers.current.size === 2) {
      const [first, second] = [...productPointers.current.values()];
      pinchStart.current = {
        distance: Math.hypot(second.x - first.x, second.y - first.y),
        zoom: productZoom,
      };
      productDrag.current = null;
      return;
    }
    if (productZoom === 1) return;
    productDrag.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offset: productOffset,
    };
  };

  const handleProductPointerMove = (event) => {
    if (productPointers.current.has(event.pointerId)) {
      productPointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    if (pinchStart.current && productPointers.current.size === 2) {
      const [first, second] = [...productPointers.current.values()];
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      setProductZoom(Math.min(2.5, Math.max(1, pinchStart.current.zoom * (distance / pinchStart.current.distance))));
      return;
    }
    if (!productDrag.current) return;
    setProductOffset({
      x: productDrag.current.offset.x + event.clientX - productDrag.current.pointerX,
      y: productDrag.current.offset.y + event.clientY - productDrag.current.pointerY,
    });
  };

  const handleProductWheel = (event) => {
    event.preventDefault();
    setProductZoom((zoom) => {
      const nextZoom = Math.min(2.5, Math.max(1, zoom - event.deltaY * 0.002));
      if (nextZoom === 1) setProductOffset({ x: 0, y: 0 });
      return nextZoom;
    });
  };

  const handleProductDoubleClick = () => {
    setProductZoom((zoom) => {
      const nextZoom = zoom === 1 ? 1.75 : 1;
      if (nextZoom === 1) setProductOffset({ x: 0, y: 0 });
      return nextZoom;
    });
  };

  const stopProductDrag = (event) => {
    productPointers.current.delete(event.pointerId);
    if (productPointers.current.size < 2) pinchStart.current = null;
    if (productDrag.current) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      productDrag.current = null;
    }
  };

  return (
    <div className="pt-24 md:pt-28">
      <div className="container-luxe">
        <Link to="/sarees" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-luxe-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> All Sarees
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery */}
          <div>
            <div
              className="aspect-[3/4] bg-muted overflow-hidden touch-pan-y"
              onTouchStart={handleGalleryTouchStart}
              onTouchEnd={handleGalleryTouchEnd}
            >
              {images[activeImg] && (
                <button
                  type="button"
                  onClick={() => openProductImage(activeImg)}
                  className="block h-full w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-inset focus:ring-foreground"
                  aria-label={`Open ${product.name} image ${activeImg + 1}`}
                >
                  <Image
                    src={images[activeImg]}
                    alt={product.name}
                    className="w-full h-full"
                    fittingType="fit"
                    loading="eager"
                    fetchPriority="high"
                    sizes="(max-width: 1023px) 100vw, 50vw"
                  />
                </button>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn("aspect-[3/4] w-20 shrink-0 snap-start bg-muted overflow-hidden border", i === activeImg ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100")}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full"
                      fittingType="fit"
                      loading="lazy"
                      fetchPriority="low"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
            {images.length > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)} className="text-[11px] uppercase tracking-luxe-sm flex items-center gap-2 editorial-link">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="text-[11px] text-muted-foreground">{activeImg + 1} / {images.length}</span>
                <button onClick={() => setActiveImg((i) => (i + 1) % images.length)} className="text-[11px] uppercase tracking-luxe-sm flex items-center gap-2 editorial-link">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:py-4">
            <p className="text-[11px] uppercase tracking-luxe text-muted-foreground">
              {product.collection} {product.fabric ? `· ${product.fabric}` : ""}
            </p>
            <h1 className="font-display text-4xl md:text-5xl mt-3 leading-[1.05]">{product.name}</h1>
            <p className="mt-4 text-sm text-muted-foreground font-light">{product.short_description}</p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl">{formatINR(price)}</span>
              {product.discount_price && product.discount_price < product.price && (
                <span className="text-muted-foreground line-through text-lg font-light">{formatINR(product.price)}</span>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {product.out_of_stock && <Tag>Out of Stock</Tag>}
              {product.trending && <Tag tone="trending">Trending</Tag>}
              {product.best_seller && <Tag tone="bestSeller">Best Seller</Tag>}
              {product.new_arrival && <Tag>New Arrival</Tag>}
              {product.featured && <Tag>Featured</Tag>}
              {product.blouse_included && <Tag>Blouse Included</Tag>}
            </div>

            <div className="mt-8 space-y-3">
              {quantity > 0 ? (
                <>
                  <div className="flex h-14 items-center justify-between border border-foreground px-5">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} aria-label="Decrease quantity" className="p-2 hover:bg-secondary"><Minus className="h-4 w-4" /></button>
                    <span className="text-sm">{quantity} in cart</span>
                    <button onClick={() => addItem(product)} disabled={quantity >= MAX_ITEM_QUANTITY} aria-label="Increase quantity" className="p-2 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"><Plus className="h-4 w-4" /></button>
                  </div>
                  {quantity >= MAX_ITEM_QUANTITY && <p className="text-center text-xs text-muted-foreground">Maximum 10 per product</p>}
                </>
              ) : (
                <button
                  disabled={product.out_of_stock}
                  onClick={() => { addItem(product); setAdded(true); setTimeout(() => setAdded(false), 2000); }}
                  className="w-full text-[11px] uppercase tracking-luxe-sm bg-foreground text-background px-7 py-4 hover:bg-accent transition-colors duration-300 flex items-center justify-center gap-2 disabled:bg-secondary disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {product.out_of_stock ? "Out of stock" : added ? <><Check className="w-4 h-4" /> Added to cart</> : <><ShoppingBag className="w-4 h-4" /> Add to cart</>}
                </button>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center text-[11px] uppercase tracking-luxe-sm border border-foreground px-7 py-4 hover:bg-foreground hover:text-background transition-colors duration-300"
                >
                  Enquire on Instagram
                </a>
                <a
                  href={`mailto:kalyan@varahikauseya.studio?subject=${enquirySubject}`}
                  className="flex-1 text-center text-[11px] uppercase tracking-luxe-sm border border-foreground px-7 py-4 hover:bg-foreground hover:text-background transition-colors duration-300"
                >
                  Email Atelier
                </a>
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground font-light leading-relaxed">
              This is a catalogue piece. Each saree is made to order; pricing and availability are confirmed on enquiry.
            </p>

            {/* Spec table */}
            <div className="mt-10 border-t border-border">
              <dl className="grid grid-cols-2 gap-x-6">
                {specs.map((s) => (
                  <div key={s.label} className="py-3 border-b border-border/60">
                    <dt className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">{s.label}</dt>
                    <dd className="text-sm font-light mt-0.5">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Accordions */}
            <div className="mt-8">
              {accordions.map((a) => (
                <div key={a.title} className="border-b border-border">
                  <button
                    onClick={() => setOpenSpec(openSpec === a.title ? null : a.title)}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-sm uppercase tracking-luxe-sm">{a.title}</span>
                    {openSpec === a.title ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                  {openSpec === a.title && (
                    <p className="pb-5 text-sm text-muted-foreground font-light leading-relaxed">{a.body}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-24 md:mt-32 pt-12 border-t border-border" aria-labelledby="reviews-heading">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[11px] uppercase tracking-luxe-sm text-muted-foreground">From the community</p>
              <h2 id="reviews-heading" className="font-display text-3xl md:text-4xl mt-3">Reviews</h2>
              <div className="mt-5 flex items-center gap-3">
                <span className="font-display text-3xl">{averageRating ? averageRating.toFixed(1) : "—"}</span>
                <div>
                  <StarRating value={Math.round(averageRating)} />
                  <p className="text-xs text-muted-foreground mt-1">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p>
                </div>
              </div>
            </div>

            <div>
              {reviews.length > 0 ? (
                <div className="space-y-7">
                  {reviews.map((review) => (
                    <article key={review.id} className="border-b border-border pb-7 last:border-0">
                      <div className="flex items-center justify-between gap-4">
                        <StarRating value={review.rating} />
                        <time className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground">
                          {review.created_date ? new Date(review.created_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : ""}
                        </time>
                      </div>
                      <p className="mt-3 text-sm font-light leading-relaxed">{review.body}</p>
                      {review.photos?.length > 0 && (
                        <div className="mt-4 flex gap-2 overflow-x-auto">
                          {review.photos.map((photo, index) => (
                            <button
                              key={photo}
                              type="button"
                              onClick={() => setReviewPhoto({ src: photo, index })}
                              className="h-20 w-20 shrink-0 overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              aria-label={`Open customer review photo ${index + 1}`}
                            >
                              <img src={photo} alt="Customer review" className="h-full w-full object-cover transition-transform hover:scale-105" loading="lazy" />
                            </button>
                          ))}
                        </div>
                      )}
                      <p className="mt-3 text-[10px] uppercase tracking-luxe-sm text-muted-foreground">{review.author_name}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-light">Be the first to share your experience with this piece.</p>
              )}

              <div className="mt-10 border-t border-border pt-8">
                {isAuthenticated ? (
                  <form onSubmit={submitReview} className="space-y-4">
                    <p className="text-[11px] uppercase tracking-luxe-sm">Share your experience</p>
                    <div className="flex gap-1" aria-label="Choose a rating">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button key={rating} type="button" onClick={() => setReviewRating(rating)} aria-label={`${rating} star${rating === 1 ? "" : "s"}`} className="p-1">
                          <Star className={cn("h-5 w-5", rating <= reviewRating ? "fill-foreground text-foreground" : "text-muted-foreground")} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewBody}
                      onChange={(event) => setReviewBody(event.target.value)}
                      maxLength={2000}
                      rows={4}
                      placeholder="What stood out to you?"
                      className="w-full resize-none border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
                    />
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-[11px] uppercase tracking-luxe-sm editorial-link">
                          <ImagePlus className="h-4 w-4" />
                          {isUploadingPhotos ? "Uploading..." : "Add photos"}
                          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleReviewPhotos} disabled={isUploadingPhotos || reviewPhotos.length >= 4} className="sr-only" />
                        </label>
                        <span className="text-xs text-muted-foreground">{reviewPhotos.length}/4</span>
                      </div>
                      {reviewPhotos.length > 0 && (
                        <div className="mt-3 flex gap-3 overflow-x-auto">
                          {reviewPhotos.map((photo) => (
                            <div key={photo.url} className="relative h-20 w-20 shrink-0">
                              <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />
                              <button type="button" onClick={() => setReviewPhotos((current) => current.filter((item) => item.url !== photo.url))} aria-label={`Remove ${photo.name}`} className="absolute right-1 top-1 bg-background/90 p-1">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button type="submit" disabled={reviewMutation.isPending || isUploadingPhotos} className="bg-foreground px-6 py-3 text-[11px] uppercase tracking-luxe-sm text-background disabled:opacity-50">
                      {reviewMutation.isPending ? "Submitting..." : "Submit review"}
                    </button>
                    {reviewStatus && <p className="text-xs text-muted-foreground">{reviewStatus}</p>}
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground font-light"> <Link to="/login" className="editorial-link text-foreground">Sign in</Link> to leave a review.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <Dialog open={!!reviewPhoto} onOpenChange={(open) => !open && setReviewPhoto(null)}>
          <DialogContent className="max-w-5xl border-0 bg-background/95 p-2 sm:p-3">
            <DialogTitle className="sr-only">Customer review photo {reviewPhoto?.index ? reviewPhoto.index + 1 : ""}</DialogTitle>
            {reviewPhoto && (
              <img
                src={reviewPhoto.src}
                alt={`Customer review photo ${reviewPhoto.index + 1}`}
                className="max-h-[85vh] w-full object-contain"
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!productImage}
          onOpenChange={(open) => {
            if (!open) setProductImage(null);
          }}
        >
          <DialogContent className="h-[100dvh] w-screen max-w-none border-0 bg-black/95 p-0 text-white sm:rounded-none">
            <DialogTitle className="sr-only">View {product.name} image {productImage ? productImage.index + 1 : ""}</DialogTitle>
            {productImage && (
              <div className="relative flex h-full min-h-0 flex-col items-center justify-center gap-4 overflow-hidden px-4 pb-5 pt-12 sm:px-8">
                <img
                  src={productImage.src}
                  alt={`${product.name} image ${productImage.index + 1}`}
                  className={cn(
                    "h-[calc(100dvh-9rem)] w-[min(92vw,900px)] shrink-0 select-none object-contain touch-none",
                    productZoom === 1 ? "cursor-zoom-in" : "cursor-grab active:cursor-grabbing"
                  )}
                  style={{
                    transform: `translate(${productOffset.x}px, ${productOffset.y}px) scale(${productZoom})`,
                    transition: productDrag.current ? "none" : "transform 200ms",
                  }}
                  onPointerDown={handleProductPointerDown}
                  onPointerMove={handleProductPointerMove}
                  onPointerUp={stopProductDrag}
                  onPointerCancel={stopProductDrag}
                  onWheel={handleProductWheel}
                  onDoubleClick={handleProductDoubleClick}
                />
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const index = (productImage.index - 1 + images.length) % images.length;
                        setProductImage({ src: images[index], index });
                        setProductZoom(1);
                        setProductOffset({ x: 0, y: 0 });
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                      aria-label="Previous product image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const index = (productImage.index + 1) % images.length;
                        setProductImage({ src: images[index], index });
                        setProductZoom(1);
                        setProductOffset({ x: 0, y: 0 });
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                      aria-label="Next product image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-black/50 p-1 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setProductZoom((zoom) => {
                      const nextZoom = Math.max(1, zoom - 0.25);
                      if (nextZoom === 1) setProductOffset({ x: 0, y: 0 });
                      return nextZoom;
                    })}
                    className="rounded-full p-2.5 transition-colors hover:bg-white/15 disabled:opacity-30"
                    disabled={productZoom === 1}
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProductZoom(1);
                      setProductOffset({ x: 0, y: 0 });
                    }}
                    className="rounded-full p-2.5 transition-colors hover:bg-white/15"
                    aria-label="Reset zoom"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductZoom((zoom) => Math.min(2.5, zoom + 0.25))}
                    className="rounded-full p-2.5 transition-colors hover:bg-white/15 disabled:opacity-30"
                    disabled={productZoom === 2.5}
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Related */}
        {related && related.filter((p) => p.id !== product.id).length > 0 && (
          <section className="mt-24 md:mt-32 pt-12 border-t border-border">
            <h2 className="font-display text-3xl md:text-4xl mb-10">You may also consider</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12">
              {related.filter((p) => p.id !== product.id).slice(0, 4).map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}><ProductCard product={p} /></Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StarRating({ value }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <Star key={rating} className={cn("h-3.5 w-3.5", rating <= value ? "fill-foreground text-foreground" : "text-muted-foreground")} />
      ))}
    </div>
  );
}

function Tag({ children, tone }) {
  return (
    <span className={cn(
      "text-[10px] uppercase tracking-luxe-sm border px-3 py-1.5",
      tone === "trending"
        ? "border-red-700 bg-red-700 text-white"
        : tone === "bestSeller"
          ? "border-amber-700 bg-amber-700 text-white"
          : "border-border"
    )}>
      {children}
    </span>
  );
}
