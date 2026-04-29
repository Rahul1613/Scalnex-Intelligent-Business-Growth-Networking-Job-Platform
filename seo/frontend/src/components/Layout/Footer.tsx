import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks: {
    product: Array<{ name: string; href: string }>;
    company: Array<{ name: string; href: string }>;
    support: Array<{ name: string; href: string }>;
    legal: Array<{ name: string; href: string }>;
  } = {
    product: [
      { name: 'Home', href: '/' },
    ],
    company: [],
    support: [],
    legal: [],
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Company Information */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-primary-600 to-success-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Exploriza
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 max-w-md">
              Empower your business with AI-driven SEO tools and growth strategies.
              Drive more traffic, generate leads, and grow your online presence.
            </p>

            {/* Contact Information */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>xyz@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>+1xx xx xx xx</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Gharda college,lavel</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3 sm:mb-4">
              Product
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          {footerLinks.company.length > 0 && (
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3 sm:mb-4">
                Company
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Support & Legal Links */}
          {(footerLinks.support.length > 0 || footerLinks.legal.length > 0) && (
            <div className="space-y-6 sm:space-y-8">
              {footerLinks.support.length > 0 && (
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3 sm:mb-4">
                    Support
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {footerLinks.support.map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.href}
                          className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {footerLinks.legal.length > 0 && (
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3 sm:mb-4">
                    Legal
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {footerLinks.legal.map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.href}
                          className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center sm:text-left">
              © {currentYear} Sujal,Rahul,Omkar.
            </p>
            {false && (
              <div className="flex space-x-4 sm:space-x-6">
                <Link to="/privacy" className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">Privacy</Link>
                <Link to="/terms" className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">Terms</Link>
                <Link to="/cookies" className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">Cookies</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
