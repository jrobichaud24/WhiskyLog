import { Card, CardContent } from "@/components/ui/card";

const regions = [
  {
    name: "Highland Region",
    distilleries: "12 Distilleries",
    image: "scottish-highlands",
  },
  {
    name: "Speyside",
    distilleries: "8 Distilleries", 
    image: "speyside-region",
  },
  {
    name: "Islay",
    distilleries: "6 Distilleries",
    image: "islay-region",
  },
  {
    name: "Lowlands",
    distilleries: "4 Distilleries",
    image: "lowlands-region",
  },
];

export default function DistilleryShowcase() {
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
          {regions.map((region, index) => (
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
