import { Button } from "@/components/ui/button";
import { Download, Apple, Star, Users, Smartphone } from "lucide-react";

export default function CallToAction() {
  const handleInstallApp = () => {
    // Trigger PWA install prompt
    window.dispatchEvent(new CustomEvent('install-app'));
  };

  return (
    <section className="py-20 whisky-gradient text-white">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6" data-testid="heading-cta">
          Start Your Whisky Journey Today
        </h2>
        <p className="text-xl mb-8 opacity-90" data-testid="text-cta-description">
          Join thousands of whisky enthusiasts tracking their collections and discovering exceptional drams
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all"
            onClick={handleInstallApp}
            data-testid="button-install-dramjournal"
          >
            <Download className="mr-2 h-5 w-5" />
            Install The Dram Journal
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-amber-600 px-8 py-4 text-lg font-semibold"
            data-testid="button-ios-app"
          >
            <Apple className="mr-2 h-5 w-5" />
            Available on iOS
          </Button>
        </div>
        <div className="mt-8 flex justify-center items-center space-x-6 text-sm opacity-75">
          <div className="flex items-center" data-testid="stat-rating">
            <Star className="h-4 w-4 text-yellow-300 mr-1 fill-current" />
            <span>9.6/10 Rating</span>
          </div>
          <div className="flex items-center" data-testid="stat-users">
            <Users className="h-4 w-4 mr-1" />
            <span>10K+ Users</span>
          </div>
          <div className="flex items-center" data-testid="stat-offline">
            <Smartphone className="h-4 w-4 mr-1" />
            <span>Works Offline</span>
          </div>
        </div>
      </div>
    </section>
  );
}
