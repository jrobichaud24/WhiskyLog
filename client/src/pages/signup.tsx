import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { insertUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import type { z } from "zod";

type SignupForm = z.infer<typeof insertUserSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignupForm>({
    resolver: zodResolver(insertUserSchema)
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm) => {
      const response = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: data
      });
      return response;
    },
    onSuccess: (user: any) => {
      toast({
        title: "Welcome to The Dram Journal!",
        description: "Your account has been created successfully.",
      });
      // Redirect admin users to admin panel, regular users to dashboard
      if (user?.isAdmin) {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: SignupForm) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-warmwhite flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden">
              <img 
                src="/logo.png" 
                alt="The Dram Journal Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="font-playfair text-3xl font-bold text-gray-800 mb-2">
            Join The Dram Journal
          </h1>
          <p className="text-gray-600">
            Start tracking your whisky journey today
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  data-testid="input-username"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-sm text-red-600" data-testid="error-username">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  data-testid="input-email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-600" data-testid="error-email">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  data-testid="input-password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-600" data-testid="error-password">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isSubmitting || signupMutation.isPending}
                data-testid="button-signup"
              >
                {isSubmitting || signupMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium" data-testid="link-login">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}