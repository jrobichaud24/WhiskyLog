import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LogOut, Star, Plus, BookOpen } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-cream to-warmwhite">
      {/* Header */}
      <header className="bg-white border-b border-amber-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="The Dram Journal Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-playfair text-2xl font-bold text-amber-600">
                  The Dram Journal
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user.username}!
                </p>
              </div>
            </div>
            <Button
              variant="outline"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Welcome Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-amber-600" />
                Your Whisky Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Welcome to your personal whisky journal! Here you can track your tastings, 
                  rate your favorite drams, and build your collection.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white" data-testid="button-add-whisky">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Whisky to Collection
                  </Button>
                  <Button variant="outline" data-testid="button-browse-whiskies">
                    Browse Whiskies
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Whiskies Tried</span>
                <span className="font-semibold text-2xl text-amber-600" data-testid="stat-whiskies-tried">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Rating</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 font-semibold" data-testid="stat-average-rating">-</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Collection Size</span>
                <span className="font-semibold text-2xl text-amber-600" data-testid="stat-collection-size">0</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Whiskies */}
        <Card>
          <CardHeader>
            <CardTitle>Discover Whiskies</CardTitle>
          </CardHeader>
          <CardContent>
            {whiskiesLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading whiskies...</p>
              </div>
            ) : whiskies && whiskies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {whiskies.map((whisky) => (
                  <Card key={whisky.id} className="hover:shadow-md transition-shadow" data-testid={`card-whisky-${whisky.id}`}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="w-full h-32 bg-amber-100 rounded-lg mb-3 flex items-center justify-center">
                          <svg className="w-12 h-12 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 2C6.45 2 6 2.45 6 3V4H5C4.45 4 4 4.45 4 5S4.45 6 5 6H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V6H19C19.55 6 20 5.55 20 5S19.55 4 19 4H18V3C18 2.45 17.55 2 17 2H7ZM8 4H16V6H8V4ZM8 8H16V19H8V8Z"/>
                          </svg>
                        </div>
                        <h4 className="font-playfair font-semibold text-gray-800 mb-1" data-testid={`text-whisky-name-${whisky.id}`}>
                          {whisky.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2" data-testid={`text-whisky-distillery-${whisky.id}`}>
                          {whisky.distillery}
                        </p>
                        <p className="text-xs text-amber-600" data-testid={`text-whisky-region-${whisky.id}`}>
                          {whisky.region} • {whisky.age ? `${whisky.age}yr` : 'NAS'} • {whisky.abv}% ABV
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No whiskies available. Check back later!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}