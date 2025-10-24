import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { Distillery } from "@shared/schema";
import { regionGalleryData } from "@/data/region-gallery";

export default function DistilleryShowcase() {
  const { data: distilleries = [], isLoading } = useQuery<Distillery[]>({
    queryKey: ["/api/distilleries"],
  });

  // Group distilleries by region and count them
  const regionCounts = distilleries.reduce((acc, distillery) => {
    const region = distillery.region;
    if (region) {
      acc[region] = (acc[region] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Enrich gallery data with actual distillery counts from database
  const displayRegions = regionGalleryData.map(galleryItem => {
    const count = regionCounts[galleryItem.region] || 0;
    return {
      ...galleryItem,
      count,
      distilleries: count === 1 ? "1 Distillery" : `${count} Distilleries`,
    };
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4" data-testid="heading-distillery">
              Journey Through <span className="text-amber-400">Scotland's Finest</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto" data-testid="text-distillery-description">
              Explore the heritage and craftsmanship behind every bottle
            </p>
          </div>
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-amber-400" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4" data-testid="heading-distillery">
            Journey Through <span className="text-amber-400">Scotland's Finest</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto" data-testid="text-distillery-description">
            Explore the heritage and craftsmanship behind every bottle
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {displayRegions.map((region, index) => (
            <figure 
              key={region.region} 
              className="relative overflow-hidden group cursor-pointer m-0"
              data-testid={`card-region-${index}`}
            >
              <div className="relative h-64 rounded-2xl overflow-hidden">
                <img 
                  src={region.image} 
                  alt={region.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <figcaption className="absolute bottom-4 left-4">
                  <h3 className="font-playfair text-lg font-semibold text-white" data-testid={`text-region-name-${index}`}>
                    {region.displayName}
                  </h3>
                  <p className="text-gray-300 text-sm" data-testid={`text-region-count-${index}`}>
                    {region.distilleries}
                  </p>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
