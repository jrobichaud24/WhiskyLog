import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { insertUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import PrivacyPolicyDialog from "@/components/privacy-policy-dialog";
import { ChevronDown } from "lucide-react";
import { z } from "zod";

// Extend the schema to include consent checkbox
const signupFormSchema = insertUserSchema.extend({
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Privacy Policy and Terms of Service"
  })
});

type SignupForm = z.infer<typeof signupFormSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<SignupForm>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      consent: false
    }
  });

  const consentValue = watch("consent");

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm) => {
      // Remove consent field before sending to API
      const { consent, ...userData } = data;
      const response = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: userData
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
      <Navigation />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    data-testid="input-first-name"
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600" data-testid="error-first-name">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    data-testid="input-last-name"
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600" data-testid="error-last-name">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

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

              {/* Privacy & Terms Section */}
              <div className="space-y-4 pt-4 border-t border-gray-200" data-testid="section-privacy-terms">
                <div className="space-y-3">
                  <h2 className="font-playfair text-lg font-semibold text-gray-900">
                    Privacy & Terms Summary
                  </h2>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>
                      At <strong>The Dram Journal</strong>, we collect just what's needed to create your account—
                      first name, last name, email, username, and password—so you can browse whisky info,
                      log tastings, add ratings, and save notes securely. We <strong>never sell</strong> your data or
                      share it for marketing. You can update or delete your account anytime.
                    </p>
                    <p>
                      By signing up, you agree to our{" "}
                      <PrivacyPolicyDialog
                        trigger={
                          <button 
                            type="button"
                            className="text-amber-600 hover:text-amber-700 underline font-medium"
                            data-testid="link-privacy-policy"
                          >
                            Privacy Policy
                          </button>
                        }
                      />{" "}
                      and{" "}
                      <a 
                        href="/terms-of-service" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-amber-600 hover:text-amber-700 underline font-medium"
                        data-testid="link-terms-of-service"
                      >
                        Terms of Service
                      </a>
                      , which explain your rights under U.S., Canadian (PIPEDA), and EU/UK (GDPR) laws.
                    </p>
                  </div>

                  <Collapsible className="space-y-2">
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800" data-testid="button-expand-privacy-details">
                      <ChevronDown className="h-4 w-4" />
                      What does this mean for you?
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2">
                      <ul className="text-sm text-gray-700 space-y-1 ml-6 list-disc" data-testid="list-privacy-details">
                        <li>Access, correct, or delete your data anytime.</li>
                        <li>Passwords are stored securely (hashed).</li>
                        <li>We use cookies/local storage only for functionality (e.g., session, preferences).</li>
                        <li>If required, we use lawful transfer safeguards (e.g., SCCs) for cross-border data.</li>
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="flex items-start gap-3 pt-2">
                    <Checkbox
                      id="consent"
                      checked={consentValue}
                      onCheckedChange={(checked) => setValue("consent", checked as boolean)}
                      className="mt-1"
                      data-testid="checkbox-consent"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor="consent" 
                        className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                      >
                        I have read and agree to the{" "}
                        <PrivacyPolicyDialog
                          trigger={
                            <button 
                              type="button"
                              className="text-amber-600 hover:text-amber-700 underline font-medium"
                              data-testid="link-consent-privacy"
                            >
                              Privacy Policy
                            </button>
                          }
                        />{" "}
                        and{" "}
                        <a 
                          href="/terms-of-service" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-amber-600 hover:text-amber-700 underline font-medium"
                          data-testid="link-consent-terms"
                        >
                          Terms of Service
                        </a>
                        .
                      </Label>
                      {errors.consent && (
                        <p className="text-sm text-red-600 mt-1" data-testid="error-consent">
                          {errors.consent.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
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