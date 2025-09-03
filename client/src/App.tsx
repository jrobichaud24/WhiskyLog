import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import ResetPassword from "@/pages/reset-password";
import VerifyEmail from "@/pages/verify-email";
import Dashboard from "@/pages/dashboard";
import Collection from "@/pages/collection";
import Reviews from "@/pages/reviews";
import AdminPage from "@/pages/admin";
import Discover from "@/pages/discover";
import Browse from "@/pages/browse";
import PWAInstall from "@/components/pwa-install";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/collection" component={Collection} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/discover" component={Discover} />
      <Route path="/browse" component={Browse} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <PWAInstall />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
