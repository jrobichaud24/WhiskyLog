import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect border-b border-amber-400/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              <img 
                src="/logo.png" 
                alt="The Dram Journal Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-playfair text-2xl font-bold text-amber-600" data-testid="logo">
              The Dram Journal
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors font-medium" data-testid="nav-home">
              Home
            </a>
            <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors font-medium" data-testid="nav-collection">
              My Collection
            </a>
            <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors font-medium" data-testid="nav-discover">
              Discover
            </a>
            <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors font-medium" data-testid="nav-reviews">
              Reviews
            </a>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" data-testid="button-get-started">
              Get Started
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-amber-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-sm border-b border-amber-400/20 py-4">
            <div className="flex flex-col space-y-4 px-4">
              <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors font-medium" data-testid="mobile-nav-home">
                Home
              </a>
              <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors font-medium" data-testid="mobile-nav-collection">
                My Collection
              </a>
              <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors font-medium" data-testid="mobile-nav-discover">
                Discover
              </a>
              <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors font-medium" data-testid="mobile-nav-reviews">
                Reviews
              </a>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white w-fit" data-testid="mobile-button-get-started">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
