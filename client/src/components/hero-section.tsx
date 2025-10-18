import { Button } from "@/components/ui/button";
import { ChevronDown, Smartphone, Play, Check } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export default function HeroSection() {
  const { installApp, canInstall, isInstalled } = usePWAInstall();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
          alt="Scottish Highland landscape" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/40"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 animate-fadeIn">
        <h1 className="font-playfair text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Your <span className="text-amber-400">Whisky Journey</span><br />
          Begins Here
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-description">
          Track, rate, and discover exceptional single malt scotch whiskies. 
          Build your personal collection and connect with fellow enthusiasts.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all"
            onClick={installApp}
            disabled={isInstalled}
            data-testid="button-install-app"
          >
            {isInstalled ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                App Installed
              </>
            ) : (
              <>
                <Smartphone className="mr-2 h-5 w-5" />
                Install App
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            size="lg"
            className="border-2 border-white text-white hover:bg-white hover:text-gray-800 px-8 py-4 text-lg font-semibold"
            data-testid="button-watch-demo"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <ChevronDown className="h-8 w-8" />
      </div>
    </section>
  );
}
