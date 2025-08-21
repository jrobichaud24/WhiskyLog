import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LogOut, Star, Plus, BookOpen, Settings, CheckCircle, Heart } from "lucide-react";

import type { User } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false
  });

  // Get user's collection data
  const { data: userProducts = [] } = useQuery<any[]>({
    queryKey: ["/api/user-products"],
    enabled: !!user,
  });



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
          <p className="text-gray-600">Loading your dram journal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  // Calculate statistics from user's collection
  const collectionWhiskies = (userProducts as any[]).filter((up: any) => up.owned);
  const whiskiesTriedCount = collectionWhiskies.length;
  const ratingsOnly = collectionWhiskies.filter((up: any) => up.rating && up.rating > 0);
  const averageRating = ratingsOnly.length > 0 
    ? (ratingsOnly.reduce((sum: number, up: any) => sum + up.rating, 0) / ratingsOnly.length).toFixed(1)
    : null;
  const wishlistCount = (userProducts as any[]).filter((up: any) => up.wishlist && !up.owned).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cream to-warmwhite">
      {/* Hero Header */}
      <header className="relative bg-gradient-to-r from-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-amber-500/20 p-2">
                <img 
                  src="/logo.png" 
                  alt="The Dram Journal Logo" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <h1 className="font-playfair text-4xl font-bold text-white mb-1">
                  The Dram Journal
                </h1>
                <p className="text-amber-200 text-lg">
                  Welcome back, {user.firstName || user.username}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg border-0" 
                onClick={() => {
                  toast({
                    title: "Add Whisky",
                    description: "Navigate to browse page to add whiskies to your collection.",
                  });
                }}
                data-testid="button-add-whisky"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Whisky to Collection
              </Button>
              
              <Button 
                variant="outline" 
                className="border-2 border-amber-200 text-amber-200 hover:bg-amber-50 hover:text-amber-700" 
                onClick={() => setLocation("/browse")}
                data-testid="button-browse-whiskies"
              >
                Browse Whiskies
              </Button>
              
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Welcome Card */}
          <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg border-b border-amber-100">
              <CardTitle className="flex items-center text-2xl text-slate-800">
                <BookOpen className="h-6 w-6 mr-3 text-amber-600" />
                Your Whisky Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <p className="text-slate-600 text-lg leading-relaxed">
                  Welcome to your personal whisky sanctuary. Here you can track your tastings, 
                  rate your favorite drams, and build your collection of exceptional single malts.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg border-0 px-6 py-3 text-lg" 
                    onClick={() => setLocation("/collection")}
                    data-testid="button-view-collection"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    View Collection
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-2 border-green-200 text-green-700 hover:bg-green-50 px-6 py-3 text-lg" 
                    onClick={() => {
                      toast({
                        title: "Coming Soon", 
                        description: "Wishlist view will be available soon. For now, you can see wishlisted items in the browse section.",
                      });
                    }}
                    data-testid="button-view-wishlist"
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    View Wishlist
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Elegant Stats Card */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl border-0">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="text-xl text-amber-200">Your Journey</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <span className="text-amber-200 text-sm font-medium">Whiskies Tried</span>
                <div className="text-4xl font-bold text-white" data-testid="stat-whiskies-tried">
                  {whiskiesTriedCount}
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <span className="text-amber-200 text-sm font-medium">Average Rating</span>
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${
                        averageRating && i < Math.floor(parseFloat(averageRating))
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-600"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-2xl font-semibold text-white" data-testid="stat-average-rating">
                  {averageRating ? `${averageRating}/5` : "Not rated yet"}
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <span className="text-amber-200 text-sm font-medium">Wishlist Items</span>
                <div className="text-4xl font-bold text-white" data-testid="stat-wishlist-size">
                  {wishlistCount}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Admin Navigation - Only show for admin users */}
        {user.isAdmin && (
          <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-xl border-0 mt-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Database Management</h3>
                    <p className="text-slate-300 text-sm">Manage distilleries and products</p>
                  </div>
                </div>
                <a href="/admin">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Open Admin Panel
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}