import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Star, Compass, Smartphone } from "lucide-react";
import featureCollection from "@assets/feature_collection.png";
import featureRating from "@assets/feature_rating.png";
import featureDiscovery from "@assets/feature_discovery.png";
import featureOffline from "@assets/feature_offline.png";

const features = [
  {
    icon: ClipboardList,
    title: "Track Your Collection",
    description: "Catalog every bottle with detailed tasting notes and personal ratings",
    image: featureCollection,
  },
  {
    icon: Star,
    title: "Rate & Review",
    description: "Share detailed reviews and discover new whiskies through community ratings",
    image: featureRating,
  },
  {
    icon: Compass,
    title: "Discover New Drams",
    description: "Get personalized recommendations based on your taste preferences",
    image: featureDiscovery,
  },
  {
    icon: Smartphone,
    title: "Offline Access",
    description: "Access your collection anywhere, even without internet connection",
    image: featureOffline,
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
              <Card key={feature.title} className="text-center group hover:shadow-xl transition-all overflow-hidden border-none" data-testid={`card-feature-${index}`}>
                <CardContent className="p-0 relative h-80 flex flex-col justify-end">
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 group-hover:from-black/80 transition-colors duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-6 text-white">
                    <div className="mb-4 flex justify-center">
                      <div className="p-3 bg-amber-600/20 rounded-full backdrop-blur-sm border border-amber-500/30 group-hover:bg-amber-600/30 transition-colors">
                        <IconComponent className="h-8 w-8 text-amber-400" />
                      </div>
                    </div>
                    <h3 className="font-playfair text-xl font-semibold mb-2 text-amber-50" data-testid={`text-feature-title-${index}`}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-sm" data-testid={`text-feature-description-${index}`}>
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
