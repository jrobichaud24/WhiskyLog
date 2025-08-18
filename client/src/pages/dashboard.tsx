import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LogOut, Star, Plus, BookOpen, Settings } from "lucide-react";
import type { User, Whisky } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false
  });

  const { data: whiskies, isLoading: whiskiesLoading } = useQuery<Whisky[]>({
    queryKey: ["/api/whiskies"]
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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  Welcome back, {user.username}
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
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg border-0 px-6 py-3 text-lg" 
                    data-testid="button-add-whisky"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Whisky to Collection
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-2 border-amber-200 text-amber-700 hover:bg-amber-50 px-6 py-3 text-lg" 
                    data-testid="button-browse-whiskies"
                  >
                    Browse Whiskies
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
                <div className="text-4xl font-bold text-white" data-testid="stat-whiskies-tried">0</div>
              </div>
              
              <div className="text-center space-y-2">
                <span className="text-amber-200 text-sm font-medium">Average Rating</span>
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-5 w-5 text-slate-600" 
                    />
                  ))}
                </div>
                <div className="text-2xl font-semibold text-slate-400" data-testid="stat-average-rating">Not rated yet</div>
              </div>
              
              <div className="text-center space-y-2">
                <span className="text-amber-200 text-sm font-medium">Collection Size</span>
                <div className="text-4xl font-bold text-white" data-testid="stat-collection-size">0</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Discover Whiskies Section */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg border-b border-slate-200">
            <CardTitle className="text-2xl text-slate-800 font-playfair">
              Discover Exceptional Whiskies
            </CardTitle>
            <p className="text-slate-600 mt-2">Explore our curated collection of single malt scotch whiskies</p>
          </CardHeader>
          <CardContent className="p-8">
            {whiskiesLoading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                  <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 2C6.45 2 6 2.45 6 3V4H5C4.45 4 4 4.45 4 5S4.45 6 5 6H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V6H19C19.55 6 20 5.55 20 5S19.55 4 19 4H18V3C18 2.45 17.55 2 17 2H7ZM8 4H16V6H8V4ZM8 8H16V19H8V8Z"/>
                  </svg>
                </div>
                <p className="text-slate-600 text-lg">Curating exceptional whiskies...</p>
              </div>
            ) : whiskies && whiskies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {whiskies.map((whisky) => (
                  <Card key={whisky.id} className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-amber-50/30 border-amber-100" data-testid={`card-whisky-${whisky.id}`}>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="w-full h-40 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl mb-4 flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-300 transition-all duration-300 shadow-inner">
                          <svg className="w-16 h-16 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 2C6.45 2 6 2.45 6 3V4H5C4.45 4 4 4.45 4 5S4.45 6 5 6H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V6H19C19.55 6 20 5.55 20 5S19.55 4 19 4H18V3C18 2.45 17.55 2 17 2H7ZM8 4H16V6H8V4ZM8 8H16V19H8V8Z"/>
                          </svg>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-playfair font-bold text-xl text-slate-800 group-hover:text-amber-800 transition-colors" data-testid={`text-whisky-name-${whisky.id}`}>
                            {whisky.name}
                          </h4>
                          <p className="text-slate-600 font-medium" data-testid={`text-whisky-distillery-${whisky.id}`}>
                            {whisky.distillery}
                          </p>
                          <div className="flex items-center justify-center space-x-2 text-sm">
                            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium" data-testid={`text-whisky-region-${whisky.id}`}>
                              {whisky.region}
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
                              {whisky.age ? `${whisky.age}yr` : 'NAS'}
                            </span>
                            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                              {whisky.abv}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-amber-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-10 h-10 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-playfair font-semibold text-slate-700 mb-2">Collection Coming Soon</h3>
                <p className="text-slate-600">Our whisky experts are carefully curating an exceptional selection of single malts for you to discover.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Navigation */}
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
      </main>
    </div>
  );
}