import { useState, useEffect } from "react";
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
  Package,
  Percent,
  Heart,
  Check,
  Plus,
  Sparkles,
  Menu
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import { getRatingLabel } from "@/lib/rating-utils";
import type { Product, Distillery, UserProduct } from "@shared/schema";

export default function Browse() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const logoutMutation = useLogout();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistillery, setSelectedDistillery] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [minABV, setMinABV] = useState("");
  const [maxABV, setMaxABV] = useState("");
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // AI Search State
  const [aiSearchResult, setAiSearchResult] = useState<any>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);

  // Add to Collection State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rating, setRating] = useState(0);
  const [tastingNotes, setTastingNotes] = useState("");

  // Queries
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: distilleries = [] } = useQuery<Distillery[]>({
    queryKey: ["/api/distilleries"],
  });

  const { data: userProducts = [] } = useQuery<UserProduct[]>({
    queryKey: ["/api/user-products"],
    enabled: !!user,
  });

  // Derived Data
  const distilleryMap = distilleries.reduce((acc, d) => ({ ...acc, [d.id]: d }), {} as Record<string, Distillery>);
  const regions = Array.from(new Set(distilleries.map(d => d.region).filter(Boolean)));

  // Check if product is in collection (owned) or wishlist
  const isInCollection = (productId: string) => userProducts.some(up => up.productId === productId && up.owned);
  const isInWishlist = (productId: string) => userProducts.some(up => up.productId === productId && up.wishlist);

  const filteredProducts = products.filter(product => {
    const distillery = product.distillery ? distilleryMap[product.distillery] : null;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (distillery?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDistillery = selectedDistillery === "all" || product.distillery === selectedDistillery;
    const matchesRegion = selectedRegion === "all" || distillery?.region === selectedRegion;
    const matchesMinABV = !minABV || (product.abvPercent && parseFloat(product.abvPercent) >= parseFloat(minABV));
    const matchesMaxABV = !maxABV || (product.abvPercent && parseFloat(product.abvPercent) <= parseFloat(maxABV));
    const matchesWishlist = !showWishlistOnly || isInWishlist(product.id);

    return matchesSearch && matchesDistillery && matchesRegion && matchesMinABV && matchesMaxABV && matchesWishlist;
  });

  const hasActiveFilters = searchTerm || selectedDistillery !== "all" || selectedRegion !== "all" || minABV || maxABV || showWishlistOnly;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDistillery("all");
    setSelectedRegion("all");
    setMinABV("");
    setMaxABV("");
    setShowWishlistOnly(false);
  };

  // Initialize from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("filter") === "wishlist") {
      setShowWishlistOnly(true);
    }
  }, []);

  // Mutations
  const identifyWhiskyMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest("/api/identify-whisky-text", {
        method: "POST",
        body: { query: text },
      });
      return res.json();
    },
    onSuccess: (data) => {
      setAiSearchResult(data);
      setIsAiSearching(false);
    },
    onError: (error) => {
      setIsAiSearching(false);
      toast({
        title: "Search Failed",
        description: "Could not identify whisky. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async () => {
      if (!aiSearchResult) return;
      const res = await apiRequest("/api/products", {
        method: "POST",
        body: aiSearchResult.whiskyData,
      });
      return res.json();
    },
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setAiSearchResult({ ...aiSearchResult, inDatabase: true, product: newProduct });
      handleAddToCollection(newProduct);
    },
    onError: (error) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addToCollectionMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/user-products", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-products"] });
      setIsDialogOpen(false);
      toast({
        title: "Added to Collection",
        description: "Whisky has been added to your collection.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest("/api/wishlist/toggle", {
        method: "POST",
        body: { productId },
      });
    },
    onSuccess: () => {
      // Invalidate user-products to update wishlist status
      queryClient.invalidateQueries({ queryKey: ["/api/user-products"] });
    },
  });

  // Handlers
  const handleAiSearch = () => {
    if (!searchTerm) return;
    setIsAiSearching(true);
    identifyWhiskyMutation.mutate(searchTerm);
  };

  const handleAddAiProduct = () => {
    createProductMutation.mutate();
  };

  const handleAddToCollection = (product: Product) => {
    setSelectedProduct(product);
    setRating(0);
    setTastingNotes("");
    setIsDialogOpen(true);
  };

  const handleSubmitCollection = () => {
    if (!selectedProduct) return;
    addToCollectionMutation.mutate({
      productId: selectedProduct.id,
      rating,
      tastingNotes,
      owned: true,
      earnedAt: new Date().toISOString(),
    });
  };

  const handleToggleWishlist = (productId: string) => {
    toggleWishlistMutation.mutate(productId);
  };

  const handleToggleCollection = (productId: string) => {
    if (isInCollection(productId)) {
      toast({ title: "Already in collection", description: "Go to your collection to manage this item." });
    } else {
      const product = products.find(p => p.id === productId);
      if (product) handleAddToCollection(product);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cream to-warmwhite">
      {/* Header */}
      <div className="bg-white border-b border-amber-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-slate-500 hover:text-slate-800"
                onClick={() => setLocation("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <div className="bg-amber-500/10 p-2 rounded-lg">
                  <Search className="h-6 w-6 text-amber-600" />
                </div>
                <h1 className="text-2xl font-playfair font-bold text-slate-800">Browse Whiskies</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              <Button
                onClick={() => setLocation("/collection")}
                variant="ghost"
                className="text-amber-700 hover:text-amber-800 hover:bg-amber-50"
              >
                My Collection
              </Button>
              <Button
                variant="outline"
                className="border-amber-200 text-amber-700 hover:bg-amber-50"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-amber-500 hover:text-amber-400 hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-slate-100 pt-4 space-y-3 animate-in slide-in-from-top-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={() => setLocation("/collection")}
              >
                My Collection
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <Card className="mb-8 bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg border-b border-amber-100">
            <CardTitle className="flex items-center text-2xl text-slate-800">
              <Search className="h-6 w-6 mr-3 text-amber-600" />
              Search & Filter Collection
              {showWishlistOnly && (
                <Badge variant="secondary" className="ml-3 bg-amber-100 text-amber-800">
                  Wishlist Only
                </Badge>
              )}
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
              <p className="text-gray-600 mb-6">
                {hasActiveFilters
                  ? "Try adjusting your filters to find more whiskies."
                  : "No whiskies are currently available in the collection."
                }
              </p>

              <div className="flex flex-col items-center gap-4">
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-amber-200 text-amber-700 hover:bg-amber-50"
                    data-testid="button-clear-all-filters"
                  >
                    Clear All Filters
                  </Button>
                )}

                {/* AI Search Fallback */}
                {searchTerm && !aiSearchResult && (
                  <div className="mt-4 p-6 bg-amber-50 rounded-lg border border-amber-100 max-w-md w-full">
                    <h4 className="font-semibold text-amber-800 mb-2 flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Can't find what you're looking for?
                    </h4>
                    <p className="text-sm text-amber-700 mb-4">
                      Use our AI to search the global whisky database and add it to the system.
                    </p>
                    <Button
                      onClick={handleAiSearch}
                      disabled={isAiSearching}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                    >
                      {isAiSearching ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Searching Global Database...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Search for "{searchTerm}" with AI
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* AI Search Results */}
                {aiSearchResult && (
                  <div className="mt-4 p-6 bg-white rounded-lg border border-amber-200 shadow-lg max-w-md w-full text-left">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-lg text-slate-800">
                        {aiSearchResult.inDatabase ? "Found in Database!" : "Whisky Identified"}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAiSearchResult(null)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Display Image if available */}
                    {aiSearchResult.whiskyData.image_url && (
                      <div className="mb-4 w-full h-48 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
                        <img
                          src={aiSearchResult.whiskyData.image_url}
                          alt={aiSearchResult.whiskyData.name}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="space-y-3 mb-6">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase">Name</span>
                        <p className="font-medium text-slate-800">{aiSearchResult.whiskyData.name}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase">Distillery</span>
                        <p className="text-sm text-slate-600">{aiSearchResult.whiskyData.distillery_name || "Unknown"}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase">Description</span>
                        <p className="text-sm text-slate-600 line-clamp-3">{aiSearchResult.whiskyData.description}</p>
                      </div>
                    </div>

                    {aiSearchResult.inDatabase ? (
                      <Button
                        onClick={() => handleAddToCollection(aiSearchResult.product)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Collection
                      </Button>
                    ) : (
                      <Button
                        onClick={handleAddAiProduct}
                        disabled={createProductMutation.isPending}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        {createProductMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adding to Database...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add to Database & Collection
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
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
                      {/* Product Image */}
                      <div className="lg:col-span-2">
                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
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
                            <Package className="h-12 w-12 mb-2 opacity-50" />
                            <span className="text-xs text-amber-500 opacity-75">No Image</span>
                          </div>
                        </div>
                      </div>

                      {/* Main Info */}
                      <div className="lg:col-span-3 space-y-3">
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
                      <div className="lg:col-span-2 space-y-2">
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
                              onClick={() => handleToggleWishlist(product.id)}
                              disabled={isInCollection(product.id)}
                              variant="outline"
                              className={`border-2 w-8 h-8 p-0 ${isInCollection(product.id)
                                ? "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                                : isInWishlist(product.id)
                                  ? "border-green-400 text-green-700 bg-green-100 hover:bg-green-150 hover:border-green-500"
                                  : "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                                }`}
                              data-testid={`button-toggle-wishlist-${product.id}`}
                            >
                              <Heart
                                className={`h-4 w-4 ${isInWishlist(product.id)
                                  ? "fill-green-600 font-bold stroke-2"
                                  : ""
                                  }`}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {isInCollection(product.id)
                                ? "Already in collection"
                                : isInWishlist(product.id)
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => handleToggleCollection(product.id)}
                              className={`w-8 h-8 p-0 shadow-lg border-0 ${isInCollection(product.id)
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                                }`}
                              data-testid={`button-toggle-collection-${product.id}`}
                            >
                              {isInCollection(product.id) ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isInCollection(product.id) ? "Remove from collection" : "Add to Journal"}</p>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-amber-600">{rating > 0 ? rating : "-"}</span>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${rating > 0 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"
                    }`}>
                    {getRatingLabel(rating)}
                  </span>
                </div>
                <div className="relative pt-2 pb-6">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={rating || 5} // Default visual position to middle if 0
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    data-testid="slider-rating"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
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