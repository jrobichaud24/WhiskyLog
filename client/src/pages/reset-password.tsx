import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ResetPasswordForm {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPassword() {
  const [step, setStep] = useState<'email' | 'password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset
  } = useForm<ResetPasswordForm>();

  const resetMutation = useMutation({
    mutationFn: async (data: { email: string; newPassword: string }) => {
      const response = await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: data
      });
      return response;
    },
    onSuccess: () => {
      setStep('success');
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmitEmail = (data: ResetPasswordForm) => {
    setEmail(data.email);
    setStep('password');
    reset({ email: data.email });
  };

  const onSubmitPassword = (data: ResetPasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    resetMutation.mutate({
      email: email,
      newPassword: data.newPassword
    });
  };

  const password = watch('newPassword');

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
            Reset Password
          </h1>
          <p className="text-gray-600">
            {step === 'email' && "Enter your email to reset your password"}
            {step === 'password' && "Create a new password"}
            {step === 'success' && "Password reset complete"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 'email' && "Find Your Account"}
              {step === 'password' && "Create New Password"}
              {step === 'success' && "All Set!"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'email' && (
              <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    data-testid="input-email"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Please enter a valid email address"
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600" data-testid="error-email">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={isSubmitting}
                  data-testid="button-find-account"
                >
                  Find Account
                </Button>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg mb-4">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    Resetting password for: <strong>{email}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    data-testid="input-new-password"
                    {...register("newPassword", { 
                      required: "New password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                  />
                  {errors.newPassword && (
                    <p className="text-sm text-red-600" data-testid="error-new-password">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    data-testid="input-confirm-password"
                    {...register("confirmPassword", { 
                      required: "Please confirm your password",
                      validate: value => value === password || "Passwords do not match"
                    })}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600" data-testid="error-confirm-password">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={isSubmitting || resetMutation.isPending}
                  data-testid="button-reset-password"
                >
                  {isSubmitting || resetMutation.isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <p className="text-gray-600">
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
                <Link href="/login">
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white" data-testid="button-sign-in">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-amber-600 hover:text-amber-700" data-testid="link-back-to-login">
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}