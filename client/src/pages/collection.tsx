import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CameraCapture from "@/components/camera-capture";
import {
  ArrowLeft,
  LogOut,
  ExternalLink,
  Loader2,
  Building2,
  DollarSign,
  Percent,
  Star,
  Trash2,
  Calendar
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import { getRatingLabel, getRatingColor } from "@/lib/rating-utils";
import type { Product, Distillery, User } from "@shared/schema";

export default function Collection() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { user, isLoading: userLoading } = useAuth();

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const { data: distilleries = [] } = useQuery<Distillery[]>({
    queryKey: ["/api/distilleries"]
  });

  // Get user's collection
  const { data: userProducts = [], isLoading: userProductsLoading } = useQuery<any[]>({
    queryKey: ["/api/user-products"],
    enabled: !!user,
  });

  const logoutMutation = useLogout();

  // Remove from collection mutation
  const removeFromCollectionMutation = useMutation({
    mutationFn: async (userProductId: string) => {
      return await apiRequest(`/api/user-products/${userProductId}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      toast({
        title: "Removed from Collection",
        description: "The whisky has been removed from your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Remove",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Redirect to login if not authenticated (using useEffect to prevent render warnings)
  React.useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  // Handle loading states after all hooks are defined
  if (userLoading || productsLoading || userProductsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cream to-warmwhite flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your collection...</p>
        </div>
      </div>
    );
  }

  // Return null if user is not authenticated (useEffect will handle redirect)
  if (!user) {
    return null;
  }

  // Create distillery map for lookups
  const distilleryMap = distilleries.reduce((acc, distillery) => {
    acc[distillery.id] = distillery;
    return acc;
  }, {} as Record<string, Distillery>);

  // Get collection whiskies (only owned items)
  const collectionItems = (userProducts as any[])
    .filter((up: any) => up.owned)
    .map((up: any) => {
      const product = products.find((p: Product) => p.id === up.productId);
      const distillery = product?.distillery ? distilleryMap[product.distillery] : null;
      return {
        userProduct: up,
        product,
        distillery
      };
    })
    .filter(item => item.product); // Only show items where we found the product

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cream to-warmwhite">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <Button
                variant="ghost"
                onClick={() => setLocation("/dashboard")}
                className="text-amber-200 hover:bg-amber-500/20 hover:text-white p-2 shrink-0"
                data-testid="button-back-dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden bg-amber-500/20 p-2 shrink-0">
                <img
                  src="/logo.png"
                  alt="The Dram Journal Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-playfair text-2xl md:text-4xl font-bold text-white mb-1 truncate">
                  Your Collection
                </h1>
                <p className="text-amber-200 text-sm md:text-lg truncate">
                  {collectionItems.length} whiskies
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full md:w-auto border-amber-200/50 text-amber-200 hover:bg-amber-500/20 hover:text-white border-2"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {collectionItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-amber-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Star className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Whiskies in Collection</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Start building your whisky collection by browsing and rating whiskies, or scan a bottle with your camera.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg border-0"
                onClick={() => setLocation("/browse")}
                data-testid="button-start-collection"
              >
                Browse Whiskies
              </Button>
              <CameraCapture onWhiskyAdded={() => queryClient.invalidateQueries({ queryKey: ["/api/user-products"] })} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Action buttons for existing collection */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-slate-800 font-playfair">Your Collection</h2>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setLocation("/browse")}
                  data-testid="button-browse-more"
                  className="flex-1 sm:flex-none"
                >
                  Browse More
                </Button>
                <div className="flex-1 sm:flex-none">
                  <CameraCapture onWhiskyAdded={() => queryClient.invalidateQueries({ queryKey: ["/api/user-products"] })} />
                </div>
              </div>
            </div>

            {collectionItems.map(({ userProduct, product, distillery }) => (
              <Card key={userProduct.id} className="bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 items-start">
                    {/* Product Image */}
                    <div className="lg:col-span-1">
                      <div className="w-full h-32 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl overflow-hidden shadow-inner">
                        {product?.productImage ? (
                          <img
                            src={product.productImage}
                            alt={`${product.name} bottle`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.classList.add('flex', 'items-center', 'justify-center');
                                const icon = document.createElement('svg');
                                icon.setAttribute('class', 'w-8 h-8 text-amber-700');
                                icon.setAttribute('fill', 'none');
                                icon.setAttribute('stroke', 'currentColor');
                                icon.setAttribute('viewBox', '0 0 24 24');
                                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>';
                                parent.appendChild(icon);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-amber-700" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="lg:col-span-3 space-y-3">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800 font-playfair">
                          {product?.name || 'Unknown Whisky'}
                        </h3>
                        <div className="text-slate-600 font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{distillery?.name || 'Unknown Distillery'}</span>
                          {distillery?.region && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                              {distillery.region}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm">
                        {product?.abvPercent && (
                          <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                            <Percent className="h-3 w-3" />
                            {product.abvPercent}% ABV
                          </div>
                        )}
                        {product?.volumeCl && (
                          <div className="bg-slate-100 px-3 py-1 rounded-full">
                            {product.volumeCl}cl
                          </div>
                        )}
                        {product?.productUrl && (
                          <a
                            href={product.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Product
                          </a>
                        )}
                      </div>

                      {product?.description && (
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Rating and Notes */}
                    <div className="lg:col-span-1 space-y-3">
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-2">Your Rating</p>
                        <div className={`text-3xl font-bold mb-1 ${getRatingColor(userProduct.rating || 0)}`}>
                          {userProduct.rating || 0}<span className="text-lg text-slate-400 font-normal">/10</span>
                        </div>
                        <div className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-full inline-block">
                          {getRatingLabel(userProduct.rating || 0)}
                        </div>
                      </div>

                      {userProduct.tastingNotes && (
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Your Notes</p>
                          <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded-lg">
                            {userProduct.tastingNotes}
                          </p>
                        </div>
                      )}

                      {userProduct.createdAt && (
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Added {new Date(userProduct.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-1 flex flex-col gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFromCollectionMutation.mutate(userProduct.id)}
                        disabled={removeFromCollectionMutation.isPending}
                        className="w-full"
                        data-testid={`button-remove-${userProduct.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}