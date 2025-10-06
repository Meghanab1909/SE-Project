import React, { useState } from 'react';
import { Heart, Users, TrendingUp, Shield, ArrowRight, Menu, X, Sparkles } from 'lucide-react';

export default function MicroDonationHomepage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(50);

  const features = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Small Donations, Big Impact",
      description: "Every rupee counts. Make micro donations that create massive change in communities."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "100% Transparent",
      description: "Track exactly where your money goes with real-time updates and impact reports."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Trusted NGOs",
      description: "All partner organizations are verified and work directly on ground-level change."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Watch Your Impact Grow",
      description: "See the collective impact of your contributions with detailed metrics and stories."
    }
  ];

  const causes = [
    { name: "Education", raised: "₹2.4M", supporters: "12,450", color: "bg-purple-500" },
    { name: "Healthcare", raised: "₹1.8M", supporters: "9,320", color: "bg-pink-500" },
    { name: "Hunger Relief", raised: "₹3.1M", supporters: "15,680", color: "bg-fuchsia-500" },
    { name: "Environment", raised: "₹1.2M", supporters: "7,890", color: "bg-violet-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">MicroSpark</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#causes" className="text-gray-700 hover:text-purple-600 transition font-medium">Causes</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 transition font-medium">How It Works</a>
              <a href="#impact" className="text-gray-700 hover:text-purple-600 transition font-medium">Impact</a>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:shadow-lg hover:scale-105 transition-all">
                Start Giving
              </button>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#causes" className="block text-gray-700 hover:text-purple-600 font-medium">Causes</a>
              <a href="#how-it-works" className="block text-gray-700 hover:text-purple-600 font-medium">How It Works</a>
              <a href="#impact" className="block text-gray-700 hover:text-purple-600 font-medium">Impact</a>
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition">
                Start Giving
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Spark change with every rupee</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Change Lives with Just <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">₹10</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of Indians making micro donations that create macro impact. 
              Every small contribution adds up to transform communities.
            </p>
            
            <div className="bg-white p-8 rounded-3xl shadow-2xl mb-6 border border-purple-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Your donation amount
              </label>
              <div className="flex items-center gap-4 mb-6">
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="flex-1 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(147 51 234) 0%, rgb(147 51 234) ${(donationAmount - 10) / 490 * 100}%, rgb(233 213 255) ${(donationAmount - 10) / 490 * 100}%, rgb(233 213 255) 100%)`
                  }}
                />
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">₹{donationAmount}</span>
              </div>
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-lg">
                Donate Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">50K+</div>
                <div className="text-gray-600">Active Donors</div>
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">₹8.5M</div>
                <div className="text-gray-600">Total Raised</div>
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">150+</div>
                <div className="text-gray-600">NGO Partners</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-30"></div>
            <div className="relative bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop" 
                alt="Community impact"
                className="rounded-2xl mb-6 w-full h-64 object-cover shadow-lg"
              />
              <h3 className="text-2xl font-bold mb-2">Real Stories, Real Impact</h3>
              <p className="text-purple-100">
                "Thanks to 245 micro donations, our village now has clean drinking water. 
                Every child can now go to school healthy."
              </p>
              <p className="mt-4 font-semibold">— Meera, Village Representative</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose MicroSpark?</h2>
            <p className="text-xl text-gray-600">Transparent, easy, and impactful micro donations</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center p-6 rounded-2xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all hover:shadow-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 rounded-2xl mb-4 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Causes */}
      <section id="causes" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Causes</h2>
            <p className="text-xl text-gray-600">Choose a cause close to your heart</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {causes.map((cause, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all cursor-pointer">
                <div className={`h-2 ${cause.color}`}></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{cause.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Raised</span>
                      <span className="font-semibold text-gray-900">{cause.raised}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Supporters</span>
                      <span className="font-semibold text-gray-900">{cause.supporters}</span>
                    </div>
                  </div>
                  <button className="mt-4 w-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all font-medium">
                    Donate Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Start Your Giving Journey Today</h2>
          <p className="text-xl mb-8 text-purple-100">
            Join our community of changemakers. Your small contribution can make a big difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-purple-50 hover:scale-105 transition-all shadow-xl">
              Sign Up Free
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">MicroSpark</span>
              </div>
              <p className="text-sm">Making giving accessible to everyone, one rupee at a time.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition">About Us</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Our NGOs</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition">FAQs</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Contact</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition">Twitter</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Facebook</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>© 2025 MicroSpark. All rights reserved. Made with ❤️ for India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}