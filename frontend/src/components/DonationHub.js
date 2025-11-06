import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Float } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { toast } from 'sonner';
import PaymentCube from './PaymentCube';
import ImpactVisualizer from './ImpactVisualizer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// User Orb with initials
function UserOrb({ user, position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });

  return (
    <group position={position}>
      <Float speed={2} floatIntensity={0.5}>
        <Sphere ref={meshRef} args={[0.5, 32, 32]}>
          <meshStandardMaterial 
            color={user.avatar_color} 
            emissive={user.avatar_color}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
        <Text
          position={[0, 0, 0.51]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {user.initials}
        </Text>
      </Float>
    </group>
  );
}

// Water Surface with Ripples
function WaterSurface({ ripples }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
    }
  });

  return (
    <>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20, 50, 50]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {ripples.map((ripple) => (
        <Ripple key={ripple.id} ripple={ripple} />
      ))}
    </>
  );
}

function Ripple({ ripple }) {
  const meshRef = useRef();
  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useFrame(() => {
    if (scale < ripple.size * 2) {
      setScale(s => s + 0.05);
      setOpacity(o => Math.max(0, o - 0.01));
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[ripple.x, -1.9, ripple.z]}
      scale={[scale, scale, 1]}
    >
      <ringGeometry args={[0.5, 0.6, 32]} />
      <meshBasicMaterial 
        color={ripple.color} 
        transparent 
        opacity={opacity}
      />
    </mesh>
  );
}

// Progress Rings for Charities
function ProgressRing({ charity, position }) {
  const progress = Math.min(charity.current_amount / charity.goal, 1);
  
  return (
    <group position={position}>
      <Float speed={1.5} floatIntensity={0.3}>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[1, 0.1, 16, 100]} />
          <meshStandardMaterial color="#2a2a3e" />
        </mesh>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[1, 0.12, 16, 100, progress * Math.PI * 2]} />
          <meshStandardMaterial 
            color="#4ECDC4" 
            emissive="#4ECDC4"
            emissiveIntensity={0.5}
          />
        </mesh>
        <Text
          position={[0, 0, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {charity.name.split(' ')[0]}
        </Text>
      </Float>
    </group>
  );
}

export default function DonationHub({ user, onLogout }) {
  const navigate = useNavigate();
  const [charities, setCharities] = useState([]);
  const [donations, setDonations] = useState([]);
  const [ripples, setRipples] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [amount, setAmount] = useState(50);
  const [showPayment, setShowPayment] = useState(false);
  const [currentDonation, setCurrentDonation] = useState(null);
  const [showImpact, setShowImpact] = useState(false);

  useEffect(() => {
    fetchCharities();
    fetchDonations();
  }, []);

  const fetchCharities = async () => {
    try {
      const response = await axios.get(`${API}/charities`);
      setCharities(response.data);
    } catch (error) {
      console.error('Error fetching charities:', error);
    }
  };

  const fetchDonations = async () => {
    try {
      const response = await axios.get(`${API}/donations?limit=50`);
      setDonations(response.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const handleDonate = async () => {
    if (!selectedCharity) {
      toast.error('Please select a charity');
      return;
    }

    if (amount < 10) {
      toast.error('Minimum donation is ₹10');
      return;
    }

    try {
      const donationRes = await axios.post(`${API}/donations`, {
        user_id: user.id,
        charity_id: selectedCharity.id,
        amount
      });

      setCurrentDonation(donationRes.data);
      setShowPayment(true);
      
      createRipple(donationRes.data);
    } catch (error) {
      toast.error('Failed to create donation');
      console.error('Donation error:', error);
    }
  };

  const createRipple = (donation) => {
    const newRipple = {
      id: donation.id,
      x: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 10,
      color: donation.ripple_color,
      size: donation.ripple_size
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 3000);
  };

  const handlePaymentComplete = () => {
    setShowPayment(false);
    setShowImpact(true);
    fetchCharities();
    toast.success('Thank you for your donation! 💝');
  };

  // Map charity types to emojis
  const getCharityIcon = (type) => {
    switch(type) {
      case 'emergency': return '🚨';
      case 'healthcare': return '🏥';
      case 'animals': return '🐾';
      case 'water': return '💧';
      case 'education': return '📚';
      case 'women': return '👩';
      default: return '💝';
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 overflow-hidden">
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} />
          
          <Suspense fallback={null}>
            <UserOrb user={user} position={[0, 2, 0]} />
            <WaterSurface ripples={ripples} />
            
            {charities.map((charity, index) => {
              const angle = (index / charities.length) * Math.PI * 2;
              const radius = 6;
              return (
                <ProgressRing 
                  key={charity.id}
                  charity={charity}
                  position={[
                    Math.cos(angle) * radius,
                    2,
                    Math.sin(angle) * radius
                  ]}
                />
              );
            })}
          </Suspense>
          
          <OrbitControls 
            enableZoom={true} 
            enablePan={false}
            maxDistance={25}
            minDistance={10}
          />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
              Welcome, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-300 mt-1">Hope Points: {user.hope_points} ✨</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/about')}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              data-testid="about-btn"
            >
              ℹ️ About Us
            </Button>
            <Button
              onClick={() => navigate('/timeline')}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              data-testid="timeline-btn"
            >
              🌳 My Timeline
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              data-testid="logout-btn"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Donation Panel */}
        <div className="glass rounded-2xl p-6 max-w-4xl">
          <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk' }}>
            Make a Ripple 💧
          </h2>
          
          <div className="space-y-4">
            {/* Charity Selection - 3 columns for 6 items */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Choose a Cause
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {charities.map((charity) => (
                  <button
                    key={charity.id}
                    onClick={() => setSelectedCharity(charity)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedCharity?.id === charity.id
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                    data-testid={`charity-${charity.charity_type}-btn`}
                  >
                    <div className="text-2xl mb-2">
                      {getCharityIcon(charity.charity_type)}
                    </div>
                    <div className="text-white font-medium text-sm">{charity.name}</div>
                    <div className="text-gray-300 text-xs mt-1">
                      ₹{charity.current_amount.toFixed(0)} / ₹{charity.goal}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Donation Amount (₹)
              </label>
              <div className="flex gap-2 mb-3">
                {[50, 100, 250, 500].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      amount === preset
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    data-testid={`amount-${preset}-btn`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="10"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                data-testid="custom-amount-input"
              />
            </div>

            <Button
              onClick={handleDonate}
              disabled={!selectedCharity || amount < 10}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl text-lg"
              data-testid="create-donation-btn"
            >
              Drop a Ripple of Hope 💝
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Cube Modal */}
      {showPayment && currentDonation && (
        <PaymentCube
          donation={currentDonation}
          onClose={() => setShowPayment(false)}
          onComplete={handlePaymentComplete}
        />
      )}

      {/* Impact Visualizer */}
      {showImpact && currentDonation && (
        <ImpactVisualizer
          charity={selectedCharity}
          amount={amount}
          onClose={() => setShowImpact(false)}
        />
      )}
    </div>
  );
}