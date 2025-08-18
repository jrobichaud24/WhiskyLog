import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import FeaturedWhiskies from "@/components/featured-whiskies";
import FeaturesSection from "@/components/features-section";
import DistilleryShowcase from "@/components/distillery-showcase";
import CallToAction from "@/components/call-to-action";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-warmwhite">
      <Navigation />
      <HeroSection />
      <FeaturedWhiskies />
      <FeaturesSection />
      <DistilleryShowcase />
      <CallToAction />
      <Footer />
    </div>
  );
}
