import { Twitter, Instagram, Facebook } from "lucide-react";

const footerSections = [
  {
    title: "Features",
    links: [
      { name: "Collection Tracking", href: "#" },
      { name: "Tasting Notes", href: "#" },
      { name: "Recommendations", href: "#" },
      { name: "Offline Access", href: "#" },
    ],
  },
  {
    title: "Community", 
    links: [
      { name: "Reviews", href: "#" },
      { name: "Forums", href: "#" },
      { name: "Events", href: "#" },
      { name: "Blog", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "#" },
      { name: "Contact Us", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div data-testid="footer-brand">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 whisky-gradient rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 2C6.45 2 6 2.45 6 3V4H5C4.45 4 4 4.45 4 5S4.45 6 5 6H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V6H19C19.55 6 20 5.55 20 5S19.55 4 19 4H18V3C18 2.45 17.55 2 17 2H7ZM8 4H16V6H8V4ZM8 8H16V19H8V8Z"/>
                </svg>
              </div>
              <span className="font-playfair text-2xl font-bold text-amber-400" data-testid="footer-logo">
                WhiskyVault
              </span>
            </div>
            <p className="text-gray-400" data-testid="footer-description">
              The premium app for whisky enthusiasts to track, rate, and discover exceptional single malts.
            </p>
          </div>
          
          {footerSections.map((section, sectionIndex) => (
            <div key={section.title} data-testid={`footer-section-${sectionIndex}`}>
              <h3 className="font-semibold text-lg mb-4" data-testid={`footer-heading-${sectionIndex}`}>
                {section.title}
              </h3>
              <ul className="space-y-2 text-gray-400">
                {section.links.map((link, linkIndex) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="hover:text-amber-400 transition-colors"
                      data-testid={`footer-link-${sectionIndex}-${linkIndex}`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400" data-testid="footer-copyright">
            © 2024 WhiskyVault. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors" data-testid="social-twitter">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors" data-testid="social-instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors" data-testid="social-facebook">
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
