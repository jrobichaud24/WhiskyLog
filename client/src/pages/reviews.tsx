import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, MessageSquare, User, Calendar, Plus } from "lucide-react";
import type { AppReview, User as UserType } from "@shared/schema";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

interface AppReviewWithUser extends AppReview {
  user?: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

export default function Reviews() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
    retry: false
  });

  const { data: reviews = [], isLoading, refetch } = useQuery<AppReviewWithUser[]>({
    queryKey: ["/api/reviews"],
  });

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; title: string; comment: string }) => {
      return await apiRequest("/api/reviews", {
        method: "POST",
        body: JSON.stringify(reviewData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      setIsDialogOpen(false);
      setFormData({ rating: 5, title: "", comment: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Submit Review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.comment.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Title and comment are required",
        variant: "destructive",
      });
      return;
    }
    createReviewMutation.mutate(formData);
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? "text-amber-400 fill-amber-400"
                : "text-slate-300"
            } ${interactive ? "cursor-pointer hover:text-amber-300" : ""}`}
            onClick={interactive && onRate ? () => onRate(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-warmwhite">
      <Navigation />
      
      {/* Header */}
      <section className="relative bg-gradient-to-r from-slate-800 to-slate-900 text-white py-20">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4" data-testid="heading-reviews">
            App <span className="text-amber-400">Reviews</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8" data-testid="text-reviews-description">
            Share your experience and read what fellow whisky enthusiasts think about The Dram Journal
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-lg">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                {renderStars(Math.round(parseFloat(averageRating)))}
                <span className="font-semibold">{averageRating}</span>
              </div>
              <p className="text-gray-300">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-amber-400">{reviews.length}</div>
              <p className="text-gray-300">Reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Share Your Experience</h3>
              <p className="text-slate-600 mb-4">
                Help other whisky enthusiasts by sharing your thoughts about The Dram Journal
              </p>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                    data-testid="button-write-review"
                    onClick={() => {
                      if (!user) {
                        toast({
                          title: "Login Required",
                          description: "Please log in to write a review",
                          variant: "destructive",
                        });
                        setTimeout(() => {
                          window.location.href = '/login';
                        }, 1000);
                        return;
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                </DialogTrigger>
                
                {user && (
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="font-playfair text-2xl text-slate-800">Write Your Review</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Rating
                        </label>
                        {renderStars(formData.rating, true, (rating) => 
                          setFormData(prev => ({ ...prev, rating }))
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                          Review Title
                        </label>
                        <Input
                          id="title"
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Summarize your experience..."
                          required
                          data-testid="input-review-title"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-2">
                          Your Review
                        </label>
                        <Textarea
                          id="comment"
                          value={formData.comment}
                          onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                          placeholder="Share your detailed thoughts about The Dram Journal..."
                          rows={4}
                          required
                          data-testid="textarea-review-comment"
                        />
                      </div>
                      
                      <div className="flex space-x-4">
                        <Button
                          type="submit"
                          disabled={createReviewMutation.isPending}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                          data-testid="button-submit-review"
                        >
                          {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          data-testid="button-cancel-review"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                )}
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 font-playfair">All Reviews</h2>
          
          {isLoading ? (
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                    <div className="h-20 bg-slate-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No Reviews Yet</h3>
                <p className="text-slate-500">
                  Be the first to share your experience with The Dram Journal!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {reviews.map((review) => (
                <Card key={review.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {review.user?.firstName && review.user?.lastName 
                                ? `${review.user.firstName} ${review.user.lastName}`
                                : review.user?.username || 'Anonymous User'
                              }
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-slate-500">
                              <Calendar className="h-3 w-3" />
                              <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mb-3">
                          {renderStars(review.rating)}
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            {review.rating}/5
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-lg text-slate-800 mb-2">
                      {review.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {review.comment}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}