import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Globe, MapPin, Package } from "lucide-react";
import Navigation from "@/components/navigation";
import type { Product, Distillery } from "@shared/schema";

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistillery, setSelectedDistillery] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [abvFilter, setAbvFilter] = useState<string>("all");

  // Fetch products and distilleries
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: distilleries = [], isLoading: distilleriesLoading } = useQuery<Distillery[]>({
    queryKey: ["/api/distilleries"],
  });

  // Get distillery name by ID
  const getDistilleryName = (distilleryId: string | null) => {
    if (!distilleryId) return "Unknown Distillery";
    const distillery = distilleries.find(d => d.id === distilleryId);
    return distillery?.name || "Unknown Distillery";
  };

  // Get distillery by ID
  const getDistillery = (distilleryId: string | null) => {
    if (!distilleryId) return null;
    return distilleries.find(d => d.id === distilleryId) || null;
  };

  // Get unique regions from distilleries
  const uniqueRegions = Array.from(new Set(distilleries.map(d => d.region))).sort();

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         getDistilleryName(product.distillery).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDistillery = selectedDistillery === "all" || product.distillery === selectedDistillery;
    
    const matchesRegion = selectedRegion === "all" || (() => {
      const distillery = getDistillery(product.distillery);
      return distillery?.region === selectedRegion;
    })();
    
    const matchesPrice = priceFilter === "all" || (() => {
      if (!product.price) return priceFilter === "unknown";
      const price = parseFloat(product.price);
      switch (priceFilter) {
        case "under-50": return price < 50;
        case "50-100": return price >= 50 && price <= 100;
        case "100-200": return price > 100 && price <= 200;
        case "over-200": return price > 200;
        default: return true;
      }
    })();

    const matchesAbv = abvFilter === "all" || (() => {
      if (!product.abvPercent) return abvFilter === "unknown";
      const abv = parseFloat(product.abvPercent);
      switch (abvFilter) {
        case "under-40": return abv < 40;
        case "40-46": return abv >= 40 && abv <= 46;
        case "46-50": return abv > 46 && abv <= 50;
        case "over-50": return abv > 50;
        default: return true;
      }
    })();

    return matchesSearch && matchesDistillery && matchesRegion && matchesPrice && matchesAbv;
  });

  // Group filtered products by distillery
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const distilleryName = getDistilleryName(product.distillery);
    if (!acc[distilleryName]) {
      acc[distilleryName] = [];
    }
    acc[distilleryName].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Sort distillery names
  const sortedDistilleryNames = Object.keys(groupedProducts).sort();

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDistillery("all");
    setSelectedRegion("all");
    setPriceFilter("all");
    setAbvFilter("all");
  };

  const isLoading = productsLoading || distilleriesLoading;

  return (
    <div className="min-h-screen bg-warmwhite">
      <Navigation />
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 py-16 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Discover Whiskies
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Explore our curated collection of exceptional single malt scotch whiskies from renowned distilleries
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search whiskies or distilleries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-products"
              />
            </div>

            {/* Distillery Filter */}
            <Select value={selectedDistillery} onValueChange={setSelectedDistillery}>
              <SelectTrigger data-testid="select-distillery-filter">
                <SelectValue placeholder="All Distilleries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Distilleries</SelectItem>
                {distilleries.map(distillery => (
                  <SelectItem key={distillery.id} value={distillery.id}>
                    {distillery.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Region Filter */}
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger data-testid="select-region-filter">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {uniqueRegions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Filter */}
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger data-testid="select-price-filter">
                <SelectValue placeholder="All Prices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-50">Under £50</SelectItem>
                <SelectItem value="50-100">£50 - £100</SelectItem>
                <SelectItem value="100-200">£100 - £200</SelectItem>
                <SelectItem value="over-200">Over £200</SelectItem>
                <SelectItem value="unknown">Price Unknown</SelectItem>
              </SelectContent>
            </Select>

            {/* ABV Filter */}
            <Select value={abvFilter} onValueChange={setAbvFilter}>
              <SelectTrigger data-testid="select-abv-filter">
                <SelectValue placeholder="All ABV" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ABV</SelectItem>
                <SelectItem value="under-40">Under 40%</SelectItem>
                <SelectItem value="40-46">40% - 46%</SelectItem>
                <SelectItem value="46-50">46% - 50%</SelectItem>
                <SelectItem value="over-50">Over 50%</SelectItem>
                <SelectItem value="unknown">ABV Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Showing {filteredProducts.length} of {products.length} whiskies
            </div>
            {(searchQuery || selectedDistillery !== "all" || selectedRegion !== "all" || priceFilter !== "all" || abvFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-amber-600 border-amber-200"
                data-testid="button-clear-filters"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Products Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-200 rounded mb-4"></div>
                  <div className="h-3 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="space-y-8">
            {sortedDistilleryNames.map(distilleryName => (
              <div key={distilleryName}>
                {/* Distillery Header */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-playfair text-2xl font-bold text-slate-800">
                      {distilleryName}
                    </h2>
                    <p className="text-slate-600">
                      {groupedProducts[distilleryName].length} {groupedProducts[distilleryName].length === 1 ? 'whisky' : 'whiskies'}
                    </p>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {groupedProducts[distilleryName].map(product => (
                    <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 bg-white border-amber-100" data-testid={`card-product-${product.id}`}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Product Image */}
                          <div className="w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                            {product.productImage ? (
                              <img 
                                src={product.productImage} 
                                alt={`${product.name} bottle`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`flex flex-col items-center justify-center text-amber-600 ${product.productImage ? 'hidden' : ''}`}>
                              <Package className="h-8 w-8 mb-1 opacity-50" />
                              <span className="text-xs text-amber-500 opacity-75">No Image</span>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-playfair font-bold text-xl text-slate-800 group-hover:text-amber-800 transition-colors line-clamp-2" data-testid={`text-product-name-${product.id}`}>
                              {product.name.replace(/<[^>]*>/g, '')}
                            </h3>
                            <p className="text-slate-600 text-sm" data-testid={`text-product-distillery-${product.id}`}>
                              {distilleryName}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {product.abvPercent && (
                              <Badge variant="outline" className="border-slate-200">
                                {product.abvPercent}% ABV
                              </Badge>
                            )}
                            {product.volumeCl && (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                {product.volumeCl}cl
                              </Badge>
                            )}
                            {product.filtration && (
                              <Badge variant="outline" className="border-amber-200 text-amber-700">
                                {product.filtration}
                              </Badge>
                            )}
                          </div>

                          {product.description && (
                            <p className="text-slate-600 text-sm line-clamp-3" data-testid={`text-product-description-${product.id}`}>
                              {product.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                            </p>
                          )}

                          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                            {product.productUrl ? (
                              <a 
                                href={product.productUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center space-x-1"
                              >
                                <Globe className="h-4 w-4" />
                                <span>View Product</span>
                              </a>
                            ) : (
                              <div></div>
                            )}
                            {product.price && (
                              <span className="font-bold text-lg text-green-600">
                                £{product.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            {products.length === 0 ? (
              <>
                <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No Whiskies Available</h3>
                <p className="text-slate-500">Check back soon for our whisky collection</p>
              </>
            ) : (
              <>
                <Search className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No Matching Whiskies</h3>
                <p className="text-slate-500">Try adjusting your search or filters to find more results</p>
              </>
            )}
          </div>
        )}
        
        {/* Creative Commons Attribution */}
        {products.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="text-center text-sm text-slate-600 space-y-2">
              <p>
                Product information and images are sourced from{' '}
                <a 
                  href="https://thewhiskyedition.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  TheWhiskyEdition.com
                </a>
                {' '}and used under the{' '}
                <a 
                  href="https://creativecommons.org/licenses/by/4.0/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Creative Commons Attribution 4.0 International License
                </a>
                .
              </p>
              <p className="text-xs text-slate-500">
                © TheWhiskyEdition.com - Content may have been adapted for display on this platform.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}