import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Filter, 
  X, 
  ArrowLeft,
  LogOut,
  ExternalLink,
  Loader2,
  Building2,
  DollarSign,
  Percent,
  Plus,
  Star,
  Heart,
  Check
} from "lucide-react";
import type { Product, Distillery, User } from "@shared/schema";

export default function Browse() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [tastingNotes, setTastingNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // User authentication
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistillery, setSelectedDistillery] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minABV, setMinABV] = useState("");
  const [maxABV, setMaxABV] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");

  // Data queries
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const { data: distilleries = [] } = useQuery<Distillery[]>({
    queryKey: ["/api/distilleries"]
  });

  // Get user's collection to check wishlist status
  const { data: userProducts = [] } = useQuery<any[]>({
    queryKey: ["/api/user-products"],
    enabled: !!user,
  });

  // Logout functionality
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create distillery map for lookups
  const distilleryMap = distilleries.reduce((acc, distillery) => {
    acc[distillery.id] = distillery;
    return acc;
  }, {} as Record<string, Distillery>);

  // Filter products based on search criteria
  const filteredProducts = products.filter(product => {
    const distillery = product.distillery ? distilleryMap[product.distillery] : null;
    
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = product.name?.toLowerCase().includes(searchLower);
      const matchesDistillery = distillery?.name?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesDistillery) return false;
    }

    // Distillery filter
    if (selectedDistillery && selectedDistillery !== "all" && product.distillery !== selectedDistillery) {
      return false;
    }

    // Price filters
    if (minPrice && product.price && parseFloat(product.price) < parseFloat(minPrice)) {
      return false;
    }
    if (maxPrice && product.price && parseFloat(product.price) > parseFloat(maxPrice)) {
      return false;
    }

    // ABV filters
    if (minABV && product.abvPercent && parseFloat(product.abvPercent) < parseFloat(minABV)) {
      return false;
    }
    if (maxABV && product.abvPercent && parseFloat(product.abvPercent) > parseFloat(maxABV)) {
      return false;
    }

    // Region filter
    if (selectedRegion && selectedRegion !== "all" && distillery?.region !== selectedRegion) {
      return false;
    }

    return true;
  });

  // Get unique regions from distilleries
  const regions = Array.from(new Set(distilleries.map(d => d.region))).filter(region => region && region.trim() !== "").sort();

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDistillery("all");
    setMinPrice("");
    setMaxPrice("");
    setMinABV("");
    setMaxABV("");
    setSelectedRegion("all");
  };

  const hasActiveFilters = searchTerm || (selectedDistillery !== "all") || minPrice || maxPrice || minABV || maxABV || (selectedRegion !== "all");

  // Add to collection mutation
  const addToCollectionMutation = useMutation({
    mutationFn: async (data: { productId: string; rating: number; tastingNotes: string }) => {
      return await apiRequest(`/api/user-products`, {
        method: "POST",
        body: {
          productId: data.productId,
          rating: data.rating,
          tastingNotes: data.tastingNotes,
          owned: true
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to Collection",
        description: `${selectedProduct?.name} has been added to your personal collection!`,
      });
      setIsDialogOpen(false);
      setSelectedProduct(null);
      setRating(0);
      setTastingNotes("");
      // Refresh user products to update UI
      queryClient.invalidateQueries({ queryKey: ["/api/user-products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      // First check if product is already in user's collection
      const response = await apiRequest(`/api/user-products/check/${productId}`, {
        method: "GET"
      });
      
      if (response.inCollection) {
        throw new Error("ALREADY_IN_COLLECTION");
      }
      
      return await apiRequest(`/api/user-products`, {
        method: "POST",
        body: {
          productId,
          wishlist: true,
          owned: false
        }
      });
    },
    onSuccess: (_, productId) => {
      const product = products?.find((p: Product) => p.id === productId);
      toast({
        title: "Added to Wishlist",
        description: `${product?.name} has been added to your wishlist!`,
      });
      // Refresh user products to update UI
      queryClient.invalidateQueries({ queryKey: ["/api/user-products"] });
    },
    onError: (error: Error) => {
      if (error.message === "ALREADY_IN_COLLECTION") {
        toast({
          title: "Already in Collection",
          description: "This whisky is already in your personal collection.",
          variant: "default",
        });
      } else {
        toast({
          title: "Failed to Add",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  const handleAddToCollection = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
    setRating(0);
    setTastingNotes("");
  };

  const handleSubmitCollection = () => {
    if (!selectedProduct || rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating before adding to your collection.",
        variant: "destructive",
      });
      return;
    }
    
    addToCollectionMutation.mutate({
      productId: selectedProduct.id,
      rating,
      tastingNotes
    });
  };

  const handleAddToWishlist = (productId: string) => {
    addToWishlistMutation.mutate(productId);
  };

  // Helper function to check if product is in wishlist
  const isInWishlist = (productId: string) => {
    return (userProducts as any[]).some((up: any) => up.productId === productId && up.wishlist);
  };

  // Helper function to check if product is in collection (owned)
  const isInCollection = (productId: string) => {
    return (userProducts as any[]).some((up: any) => up.productId === productId && up.owned);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-warmwhite flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-lg overflow-hidden mx-auto mb-4">
            <img 
              src="/logo.png" 
              alt="The Dram Journal Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-gray-600">Loading your whisky collection...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cream to-warmwhite">
      {/* Personal Header - same style as dashboard */}
      <header className="relative bg-gradient-to-r from-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/dashboard")}
                className="text-amber-200 hover:bg-amber-500/20 hover:text-white p-2"
                data-testid="button-back-dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-amber-500/20 p-2">
                <img 
                  src="/logo.png" 
                  alt="The Dram Journal Logo" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <h1 className="font-playfair text-4xl font-bold text-white mb-1">
                  Browse Collection
                </h1>
                <p className="text-amber-200 text-lg">
                  Discover whiskies for your journal, {user.firstName || user.username}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-amber-200/50 text-amber-200 hover:bg-amber-500/20 hover:text-white border-2"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter Section */}
        <Card className="mb-8 bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg border-b border-amber-100">
            <CardTitle className="flex items-center text-2xl text-slate-800">
              <Search className="h-6 w-6 mr-3 text-amber-600" />
              Search & Filter Collection
            </CardTitle>
            <CardDescription className="text-slate-600">
              Find the perfect whisky for your tasting journey. Showing {filteredProducts.length} of {products.length} products.
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="ml-4 text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-auto p-1"
                  data-testid="button-clear-filters"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by whisky name or distillery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500/20"
                data-testid="input-search"
              />
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Distillery Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Distillery</label>
                <Select value={selectedDistillery} onValueChange={setSelectedDistillery}>
                  <SelectTrigger className="bg-white border-gray-200 focus:border-amber-500" data-testid="select-distillery">
                    <SelectValue placeholder="All Distilleries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Distilleries</SelectItem>
                    {distilleries.map((distillery) => (
                      <SelectItem key={distillery.id} value={distillery.id}>
                        {distillery.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Region Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="bg-white border-gray-200 focus:border-amber-500" data-testid="select-region">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Price Range (£)</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="bg-white border-gray-200 focus:border-amber-500"
                    data-testid="input-min-price"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="bg-white border-gray-200 focus:border-amber-500"
                    data-testid="input-max-price"
                  />
                </div>
              </div>

              {/* ABV Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">ABV Range (%)</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minABV}
                    onChange={(e) => setMinABV(e.target.value)}
                    className="bg-white border-gray-200 focus:border-amber-500"
                    data-testid="input-min-abv"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxABV}
                    onChange={(e) => setMaxABV(e.target.value)}
                    className="bg-white border-gray-200 focus:border-amber-500"
                    data-testid="input-max-abv"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No whiskies found</h3>
              <p className="text-gray-600 mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your filters to find more whiskies." 
                  : "No whiskies are currently available in the collection."
                }
              </p>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  data-testid="button-clear-all-filters"
                >
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const distillery = product.distillery ? distilleryMap[product.distillery] : null;
              
              return (
                <Card 
                  key={product.id} 
                  className="group hover:shadow-xl transition-all duration-300 bg-white/95 backdrop-blur-sm border-0"
                  data-testid={`card-product-${product.id}`}
                >
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Main Info */}
                      <div className="lg:col-span-4 space-y-3">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 group-hover:text-amber-700 transition-colors mb-2">
                            {product.name}
                          </h3>
                          {distillery && (
                            <div className="flex items-center text-slate-600 mb-2">
                              <Building2 className="h-4 w-4 mr-2 text-amber-600" />
                              <span className="font-medium">{distillery.name}</span>
                            </div>
                          )}
                          {distillery?.region && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                              {distillery.region}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Technical Details */}
                      <div className="lg:col-span-3 space-y-2">
                        {product.abvPercent && (
                          <div className="flex items-center text-sm text-slate-600">
                            <Percent className="h-4 w-4 mr-2 text-amber-600" />
                            <span className="font-medium">{product.abvPercent}% ABV</span>
                          </div>
                        )}
                        {product.volumeCl && (
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">Volume:</span> {product.volumeCl}cl
                          </div>
                        )}
                        {product.filtration && (
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">Filtration:</span> {product.filtration}
                          </div>
                        )}
                        {product.price && (
                          <div className="flex items-center text-sm text-slate-600">
                            <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                            <span className="font-medium">£{product.price}</span>
                          </div>
                        )}
                      </div>

                      {/* Description & Tasting Notes */}
                      <div className="lg:col-span-4 space-y-3">
                        {product.description && (
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        
                        {/* Condensed Tasting Notes */}
                        {(product.tastingNose || product.tastingTaste || product.tastingFinish) && (
                          <div className="space-y-1">
                            {product.tastingNose && (
                              <p className="text-xs text-slate-600">
                                <span className="font-medium text-amber-700">Nose:</span> {product.tastingNose.substring(0, 80)}{product.tastingNose.length > 80 ? '...' : ''}
                              </p>
                            )}
                            {product.tastingTaste && (
                              <p className="text-xs text-slate-600">
                                <span className="font-medium text-amber-700">Taste:</span> {product.tastingTaste.substring(0, 80)}{product.tastingTaste.length > 80 ? '...' : ''}
                              </p>
                            )}
                            {product.tastingFinish && (
                              <p className="text-xs text-slate-600">
                                <span className="font-medium text-amber-700">Finish:</span> {product.tastingFinish.substring(0, 80)}{product.tastingFinish.length > 80 ? '...' : ''}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 flex flex-col gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm"
                              onClick={() => handleAddToWishlist(product.id)}
                              variant="outline"
                              className={`border-2 w-8 h-8 p-0 ${
                                isInWishlist(product.id)
                                  ? "border-green-400 text-green-700 bg-green-100 hover:bg-green-150 hover:border-green-500"
                                  : "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                              }`}
                              data-testid={`button-add-to-wishlist-${product.id}`}
                            >
                              <Heart 
                                className={`h-4 w-4 ${
                                  isInWishlist(product.id) 
                                    ? "fill-green-600 font-bold stroke-2" 
                                    : ""
                                }`} 
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isInWishlist(product.id) ? "Whisky in wishlist" : "Add to Wishlist"}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm"
                              onClick={isInCollection(product.id) ? undefined : () => handleAddToCollection(product)}
                              disabled={isInCollection(product.id)}
                              className={`w-8 h-8 p-0 shadow-lg border-0 ${
                                isInCollection(product.id)
                                  ? "bg-green-500 hover:bg-green-500 text-white cursor-default"
                                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                              }`}
                              data-testid={`button-add-to-journal-${product.id}`}
                            >
                              {isInCollection(product.id) ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isInCollection(product.id) ? "In your collection" : "Add to Journal"}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {product.productUrl && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-2 border-amber-200 text-amber-700 hover:bg-amber-50 w-8 h-8 p-0"
                                onClick={() => product.productUrl && window.open(product.productUrl, '_blank')}
                                data-testid={`button-view-product-${product.id}`}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Visit Website</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Add to Collection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Your Collection</DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <>Add <strong>{selectedProduct.name}</strong> to your personal whisky journal with a rating and notes.</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Rating Section */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Your Rating *</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 hover:scale-110 transition-transform"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    data-testid={`star-${star}`}
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {rating > 0 ? `${rating}/5 stars` : "Click to rate"}
                </span>
              </div>
            </div>

            {/* Tasting Notes */}
            <div className="space-y-2">
              <Label htmlFor="tastingNotes" className="text-sm font-medium">
                Personal Tasting Notes (Optional)
              </Label>
              <Textarea
                id="tastingNotes"
                placeholder="Share your thoughts about this whisky... aroma, taste, finish, or any personal observations."
                value={tastingNotes}
                onChange={(e) => setTastingNotes(e.target.value)}
                className="resize-none"
                rows={3}
                data-testid="textarea-tasting-notes"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              data-testid="button-cancel-add"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCollection}
              disabled={rating === 0 || addToCollectionMutation.isPending}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              data-testid="button-confirm-add"
            >
              {addToCollectionMutation.isPending ? "Adding..." : "Add to Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}