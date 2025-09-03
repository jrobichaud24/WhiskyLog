import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [location] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }
    
    // Call verification endpoint
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please try again later.');
      }
    };
    
    verifyEmail();
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            🥃 The Dram Journal
          </CardTitle>
          <p className="text-gray-300">Email Verification</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 text-amber-400 animate-spin" />
                <p className="text-gray-300 text-center">Verifying your email address...</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 text-green-400" />
                <div className="text-center space-y-2">
                  <p className="text-green-400 font-medium">Email Verified Successfully!</p>
                  <p className="text-gray-300 text-sm">{message}</p>
                </div>
                <Link href="/login" data-testid="link-login">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                    Continue to Login
                  </Button>
                </Link>
              </>
            )}
            
            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-red-400" />
                <div className="text-center space-y-2">
                  <p className="text-red-400 font-medium">Verification Failed</p>
                  <p className="text-gray-300 text-sm">{message}</p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <Link href="/signup" data-testid="link-signup">
                    <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                      Sign Up Again
                    </Button>
                  </Link>
                  <Link href="/login" data-testid="link-login-retry">
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                      Try Login
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}