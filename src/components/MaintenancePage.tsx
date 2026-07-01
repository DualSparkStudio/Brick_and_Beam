import React from 'react';
import SEO from './SEO';

const MaintenancePage: React.FC = () => {
  return (
    <>
      <SEO 
        title="Site Under Maintenance - Brick and Beam"
        description="We're currently performing scheduled maintenance to improve your experience. We'll be back soon!"
        keywords="maintenance, Brick and Beam, booking system"
        url="https://riverbreezehomestay.com"
      />
      <div className="min-h-screen bg-gradient-to-br from-ocean-800 to-forest-800 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center text-white">
          {/* Logo/Icon */}
          <div className="mb-8">
            <div className="h-20 w-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🏠</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Brick and Beam</h1>
            <p className="text-xl text-white/80">Bhilar, Mahabaleshwar, Maharashtra</p>
          </div>

          {/* Maintenance Message */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
            <div className="mb-6">
              <div className="h-16 w-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Site Under Maintenance</h2>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                We're currently performing scheduled maintenance to improve your experience and add new features.
              </p>
            </div>
            
            <div className="space-y-4 text-white/80">
              <p className="text-lg">
                <strong className="text-white">Expected downtime:</strong> 2-4 hours
              </p>
              <p className="text-lg">
                <strong className="text-white">We're working on:</strong> System updates and improvements
              </p>
            </div>
          </div>


          {/* Contact Information */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-4">Need Immediate Assistance?</h3>
            <div className="space-y-3">
              <p className="text-lg">
                <span className="font-semibold">📞 Phone:</span> 
                <a href="tel:+919876543210" className="ml-2 hover:text-white/80 transition-colors">
                  +91 98765 43210
                </a>
              </p>
              <p className="text-lg">
                <span className="font-semibold">📧 Email:</span> 
                <a href="mailto:admin@resortbookingsystem.com" className="ml-2 hover:text-white/80 transition-colors">
                  admin@resortbookingsystem.com
                </a>
              </p>
              <p className="text-lg">
                <span className="font-semibold">📍 Location:</span> 
                <span className="ml-2">Sample Address, City, State, PIN Code, India</span>
              </p>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex justify-center space-x-6">
            <a 
              href="#" 
              className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-300 transform hover:scale-110"
              aria-label="Facebook"
            >
              <span className="text-2xl">📘</span>
            </a>
            <a 
              href="#" 
              className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-300 transform hover:scale-110"
              aria-label="Instagram"
            >
              <span className="text-2xl">📷</span>
            </a>
            <a 
              href="#" 
              className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-300 transform hover:scale-110"
              aria-label="WhatsApp"
            >
              <span className="text-2xl">💬</span>
            </a>
          </div>

          {/* Footer */}
          <div className="mt-8 text-white/60">
            <p>Thank you for your patience. We'll be back soon!</p>
            <p className="text-sm mt-2">
              © 2024 Brick and Beam. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MaintenancePage;
