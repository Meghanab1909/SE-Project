import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, Heart, Users, Globe, Target, Shield, TrendingUp } from 'lucide-react';

export default function AboutUs({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <Button
              onClick={() => navigate('/hub')}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              data-testid="back-to-hub-btn"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Hub
            </Button>
            {user && (
              <Button
                onClick={onLogout}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                data-testid="logout-btn"
              >
                Logout
              </Button>
            )}
          </div>

          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              About MicroSpark
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transforming micro-donations into macro-impact through immersive 3D experiences
            </p>
          </div>

          {/* Mission Section */}
          <div className="glass rounded-3xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-purple-500/20 rounded-full">
                <Heart size={32} className="text-purple-300" />
              </div>
              <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                Our Mission
              </h2>
            </div>
            <p className="text-gray-200 text-lg leading-relaxed">
              At MicroSpark, we believe that every small donation creates ripples of change. 
              Our platform combines cutting-edge 3D visualization technology with the power of 
              micro-donations to make giving an immersive, engaging, and impactful experience. 
              We're not just a donation platform—we're a movement to democratize philanthropy 
              and make every contribution count.
            </p>
          </div>

          {/* Why Choose Us */}
          <div className="glass rounded-3xl p-8 mb-8">
            <h2 className="text-4xl font-bold text-white mb-8 text-center" style={{ fontFamily: 'Space Grotesk' }}>
              Why Choose MicroSpark?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg h-fit">
                  <Target size={24} className="text-purple-300" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Immersive Experience</h4>
                  <p className="text-gray-300">
                    Watch your donations come to life in stunning 3D visualizations. 
                    See ripples spread, trees grow, and butterflies fly—making every 
                    contribution tangible and memorable.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg h-fit">
                  <Shield size={24} className="text-blue-300" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">100% Transparent</h4>
                  <p className="text-gray-300">
                    Track every rupee. Our real-time dashboard shows exactly where your 
                    money goes and the impact it creates. No hidden fees, complete transparency.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg h-fit">
                  <Users size={24} className="text-green-300" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Community Driven</h4>
                  <p className="text-gray-300">
                    Join a community of changemakers. Share your donation stories, 
                    earn Hope Points, and see how your contributions combine with others 
                    to create massive impact.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-pink-500/20 rounded-lg h-fit">
                  <TrendingUp size={24} className="text-pink-300" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Gamified Giving</h4>
                  <p className="text-gray-300">
                    Make giving fun! Earn Hope Points, unlock achievements, compete on 
                    leaderboards, and build your personal timeline garden of generosity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Meet Our Team */}
          <div className="glass rounded-3xl p-8 mb-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk' }}>
              Meet Our Team
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              The passionate minds behind MicroSpark, united by a shared vision — to make small donations create a big difference.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: 'Mitha', image: '/mitha.png' },
                { name: 'Rakshitha', image: '/rakshitha.png' },
                { name: 'Mrunal', image: '/mrunal.png' },
                { name: 'Meghana', image: '/meghana.png' },
              ].map((member) => (
                <div key={member.name} className="text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 mx-auto rounded-full border-2 border-purple-400 shadow-lg mb-4 object-cover"
                  />
                  <h4 className="text-white font-semibold text-lg">{member.name}</h4>
                  <p className="text-gray-400 text-sm">Team Member</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Section */}
          <div className="glass rounded-3xl p-8 mb-8">
            <h2 className="text-4xl font-bold text-white mb-6 text-center" style={{ fontFamily: 'Space Grotesk' }}>
              Built with Cutting-Edge Technology
            </h2>
            <p className="text-gray-200 text-center mb-8 max-w-3xl mx-auto">
              MicroSpark leverages the latest in web technology to deliver a seamless, 
              immersive experience that makes philanthropy accessible, transparent, and fun.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['React 19', 'Three.js', 'FastAPI', 'MongoDB', 'Face AI', 'WebGL', 'UPI Payment', 'Real-time 3D'].map((tech) => (
                <div key={tech} className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                  <div className="text-white font-medium">{tech}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="glass rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Ready to Make an Impact?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of donors who are creating ripples of change. 
              Every micro-donation counts, every contribution matters.
            </p>
            <Button
              onClick={() => navigate('/hub')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-6 rounded-xl text-lg"
              data-testid="start-donating-btn"
            >
              Start Donating Today ✨
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 pb-8">
            <p className="text-gray-400 text-sm">
              Made with ❤️ by the MicroSpark Team | © 2025 All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
