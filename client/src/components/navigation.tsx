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
            <div className="w-10 h-10 whisky-gradient rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 2C6.45 2 6 2.45 6 3V4H5C4.45 4 4 4.45 4 5S4.45 6 5 6H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V6H19C19.55 6 20 5.55 20 5S19.55 4 19 4H18V3C18 2.45 17.55 2 17 2H7ZM8 4H16V6H8V4ZM8 8H16V19H8V8Z"/>
              </svg>
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
