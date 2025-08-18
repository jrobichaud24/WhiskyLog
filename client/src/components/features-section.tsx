import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Star, Compass, Smartphone } from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Track Your Collection",
    description: "Catalog every bottle with detailed tasting notes and personal ratings",
    image: "whisky-collection-tracking",
  },
  {
    icon: Star,
    title: "Rate & Review",
    description: "Share detailed reviews and discover new whiskies through community ratings",
    image: "whisky-rating-system",
  },
  {
    icon: Compass,
    title: "Discover New Drams",
    description: "Get personalized recommendations based on your taste preferences",
    image: "whisky-discovery",
  },
  {
    icon: Smartphone,
    title: "Offline Access",
    description: "Access your collection anywhere, even without internet connection",
    image: "offline-functionality",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-cream to-warmwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-800 mb-4" data-testid="heading-features">
            Perfect Your <span className="text-amber-600">Tasting Experience</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-features-description">
            Advanced features designed for the discerning whisky enthusiast
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={feature.title} className="text-center group hover:shadow-lg transition-all" data-testid={`card-feature-${index}`}>
                <CardContent className="p-6">
                  <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-t from-amber-600/20 to-transparent h-48">
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-600/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-amber-600">
                      <IconComponent className="h-12 w-12" />
                    </div>
                  </div>
                  <h3 className="font-playfair text-xl font-semibold text-gray-800 mb-2" data-testid={`text-feature-title-${index}`}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-600" data-testid={`text-feature-description-${index}`}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
