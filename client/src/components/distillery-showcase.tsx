import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Distillery } from "@shared/schema";

const regionDisplayOrder = [
  "Highland",
  "Speyside", 
  "Islay",
  "Lowlands",
];

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

  // Create display regions with actual counts
  const displayRegions = regionDisplayOrder.map(region => {
    const count = regionCounts[region] || 0;
    const displayName = region === "Highland" ? "Highland Region" : region;
    return {
      name: displayName,
      distilleries: count === 1 ? "1 Distillery" : `${count} Distilleries`,
      count: count,
      region: region
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
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayRegions.map((region, index) => (
            <Card 
              key={region.name} 
              className="relative overflow-hidden group cursor-pointer bg-transparent border-none"
              data-testid={`card-region-${index}`}
            >
              <CardContent className="p-0">
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-t from-gray-700 to-gray-500 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="font-playfair text-lg font-semibold text-white" data-testid={`text-region-name-${index}`}>
                      {region.name}
                    </h3>
                    <p className="text-gray-300 text-sm" data-testid={`text-region-count-${index}`}>
                      {region.distilleries}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
