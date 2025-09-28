import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { Award, Trophy, Star, Target, Gift, Crown, Medal, Shield } from "lucide-react";
import type { Badge as BadgeType, UserBadge } from "@shared/schema";

export default function Badges() {
  // Fetch all available badges
  const { data: badges = [], isLoading: badgesLoading } = useQuery<BadgeType[]>({
    queryKey: ["/api/badges"],
  });

  // Fetch user's earned badges
  const { data: userBadges = [], isLoading: userBadgesLoading } = useQuery<UserBadge[]>({
    queryKey: ["/api/user-badges"],
  });

  // Create a set of earned badge IDs for quick lookup
  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));

  // Get icon component based on badge icon name
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      award: Award,
      trophy: Trophy,
      star: Star,
      target: Target,
      gift: Gift,
      crown: Crown,
      medal: Medal,
      shield: Shield,
    };
    return iconMap[iconName.toLowerCase()] || Award;
  };

  // Get rarity styling
  const getRarityStyles = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary':
        return 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-white border-amber-300';
      case 'epic':
        return 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white border-purple-400';
      case 'rare':
        return 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-blue-400';
      default:
        return 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white border-gray-400';
    }
  };

  // Get rarity label styling
  const getRarityLabelStyles = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'epic':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rare':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Group badges by category
  const badgesByCategory = badges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, BadgeType[]>);

  const categoryDisplayNames: Record<string, string> = {
    collection: "Collection Milestones",
    tasting: "Tasting Achievements", 
    exploration: "Discovery Badges",
    social: "Community Achievements",
    special: "Special Recognition"
  };

  if (badgesLoading || userBadgesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cream to-warmwhite">
        <Navigation />
        <div className="pt-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-12">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-slate-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="h-4 bg-slate-200 rounded mb-4"></div>
                    <div className="h-3 bg-slate-200 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cream to-warmwhite">
      <Navigation />
      
      {/* Header */}
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-12">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-amber-100 p-3 rounded-xl">
                <Trophy className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <h1 className="font-playfair text-4xl font-bold text-slate-800 mb-4">
              Your Achievements
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Track your whisky journey progress and earn badges for exploring, tasting, and collecting exceptional drams.
            </p>
            <div className="mt-6 flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{userBadges.length}</div>
                <div className="text-sm text-slate-600">Badges Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-600">{badges.length}</div>
                <div className="text-sm text-slate-600">Total Available</div>
              </div>
            </div>
          </div>

          {/* Badge Categories */}
          {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
            <div key={category} className="mb-12">
              <h2 className="font-playfair text-2xl font-bold text-slate-800 mb-6">
                {categoryDisplayNames[category] || category}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryBadges.map((badge) => {
                  const isEarned = earnedBadgeIds.has(badge.id);
                  const IconComponent = getIconComponent(badge.icon);
                  
                  return (
                    <Card 
                      key={badge.id} 
                      className={`transition-all duration-300 hover:shadow-lg ${
                        isEarned 
                          ? 'bg-white border-amber-200 shadow-md' 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                      data-testid={`badge-${badge.id}`}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-lg ${
                            isEarned 
                              ? getRarityStyles(badge.rarity)
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              isEarned 
                                ? getRarityLabelStyles(badge.rarity)
                                : 'bg-gray-100 text-gray-600 border-gray-300'
                            }`}
                          >
                            {badge.rarity}
                          </Badge>
                        </div>
                        <CardTitle className={`text-lg ${
                          isEarned ? 'text-slate-800' : 'text-gray-500'
                        }`}>
                          {badge.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className={`text-sm mb-3 ${
                          isEarned ? 'text-slate-600' : 'text-gray-500'
                        }`}>
                          {badge.description}
                        </p>
                        <p className={`text-xs ${
                          isEarned ? 'text-slate-500' : 'text-gray-400'
                        }`}>
                          <strong>How to earn:</strong> {badge.requirement}
                        </p>
                        {isEarned && (
                          <div className="mt-3 flex items-center text-xs text-amber-600">
                            <Award className="h-3 w-3 mr-1" />
                            <span>Earned!</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}

          {badges.length === 0 && (
            <div className="text-center py-16">
              <Trophy className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Badges Available</h3>
              <p className="text-slate-500">Badges are being prepared for your whisky journey</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}