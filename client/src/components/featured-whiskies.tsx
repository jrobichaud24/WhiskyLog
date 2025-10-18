import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Star, Loader2 } from "lucide-react";
import type { Product } from "@shared/schema";

export default function FeaturedWhiskies() {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600" data-testid="error-featured-whiskies">
              Failed to load featured whiskies. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-slideUp">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-800 mb-4" data-testid="heading-featured-whiskies">
            Discover Premium <span className="text-amber-600">Single Malts</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-featured-description">
            Explore our curated collection of exceptional scotch whiskies from renowned distilleries across Scotland
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {products?.slice(0, 6).map((product, index) => (
            <Card 
              key={product.id} 
              className="group cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-b from-gray-50 to-gray-100"
              style={{ animationDelay: `${index * 0.2}s` }}
              data-testid={`card-product-${product.id}`}
            >
              <CardContent className="p-6">
                <div className="w-full h-40 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg mb-4 overflow-hidden">
                  {product.productImage ? (
                    <img 
                      src={product.productImage} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 2C6.45 2 6 2.45 6 3V4H5C4.45 4 4 4.45 4 5S4.45 6 5 6H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V6H19C19.55 6 20 5.55 20 5S19.55 4 19 4H18V3C18 2.45 17.55 2 17 2H7ZM8 4H16V6H8V4ZM8 8H16V19H8V8Z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className="w-4 h-4 fill-current" 
                          data-testid={`star-${product.id}-${star}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="font-playfair font-semibold text-gray-800 text-sm" data-testid={`text-product-name-${product.id}`}>
                    {product.name}
                  </p>
                  {product.abvPercent && (
                    <p className="text-xs text-gray-600" data-testid={`text-product-abv-${product.id}`}>
                      {product.abvPercent}% ABV
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Link href="/discover">
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 font-semibold"
              data-testid="button-explore-collection"
            >
              Explore Full Collection
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
