import Hero from "@/components/site/sections/Hero";
import FeaturedCollections from "@/components/site/sections/FeaturedCollections";
import FeaturedSarees from "@/components/site/sections/FeaturedSarees";
import Heritage from "@/components/site/sections/Heritage";
import Craftsmanship from "@/components/site/sections/Craftsmanship";
import JournalPreview from "@/components/site/sections/JournalPreview";
import InstagramGallery from "@/components/site/sections/InstagramGallery";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCollections />
      <FeaturedSarees />
      <Heritage />
      <Craftsmanship />
      <JournalPreview />
      <InstagramGallery />
    </>
  );
}