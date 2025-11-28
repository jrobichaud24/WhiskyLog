import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Award, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Badge, UserBadge } from "@shared/schema";

export default function Badges() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: allBadges = [] } = useQuery<Badge[]>({
    queryKey: ["/api/badges"],
  });

  const { data: userBadges = [] } = useQuery<UserBadge[]>({
    queryKey: ["/api/user-badges"],
    enabled: !!user,
  });

  // Create a map of earned badges for easy lookup
  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cream to-warmwhite">
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-slate-700/50 mr-4"
              onClick={() => setLocation("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-playfair font-bold">Your Badge Collection</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            const userBadge = userBadges.find(ub => ub.badgeId === badge.id);

            return (
              <Card
                key={badge.id}
                className={`border-2 transition-all duration-300 ${isEarned
                  ? "border-amber-200 bg-white shadow-md hover:shadow-xl"
                  : "border-slate-200 bg-slate-50/50 opacity-70"
                  }`}
              >
                <CardContent className="p-6 flex flex-col items-center text-center h-full">
                  <div className={`w-24 h-24 mb-4 rounded-full flex items-center justify-center ${isEarned ? "bg-amber-50" : "bg-slate-100"
                    }`}>
                    {badge.imageUrl ? (
                      <img
                        src={badge.imageUrl}
                        alt={badge.name}
                        className={`w-20 h-20 object-contain drop-shadow-sm transition-all duration-500 ${isEarned ? "filter-none scale-100" : "grayscale opacity-50 scale-95"
                          }`}
                      />
                    ) : (
                      isEarned ? (
                        <Award className="h-10 w-10 text-amber-600" />
                      ) : (
                        <Lock className="h-10 w-10 text-slate-400" />
                      )
                    )}
                  </div>

                  <h3 className={`font-playfair font-bold text-lg mb-2 ${isEarned ? "text-slate-800" : "text-slate-500"
                    }`}>
                    {badge.name}
                  </h3>

                  <p className="text-sm text-slate-600 mb-4 flex-grow">
                    {badge.description}
                  </p>

                  {isEarned ? (
                    <div className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                      Earned {userBadge?.earnedAt ? new Date(userBadge.earnedAt).toLocaleDateString() : ""}
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                      Locked
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}