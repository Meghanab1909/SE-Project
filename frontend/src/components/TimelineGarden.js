import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { AudioRecorder } from './AudioRecorder';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Timeline Item 3D
function TimelineItem3D({ item, position, index }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.2;
      if (hovered) {
        meshRef.current.scale.setScalar(1.2);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  const getShape = () => {
    switch (item.visual_type) {
      case 'tree':
        return (
          <mesh ref={meshRef} position={position}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <coneGeometry args={[0.5, 1, 8]} />
            <meshStandardMaterial color="#228B22" emissive="#32CD32" emissiveIntensity={hovered ? 0.5 : 0.2} />
          </mesh>
        );
      case 'butterfly':
        return (
          <group ref={meshRef} position={position}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <mesh position={[-0.3, 0, 0]}>
              <sphereGeometry args={[0.3, 8, 8, 0, Math.PI]} />
              <meshStandardMaterial color="#FF69B4" emissive="#FF1493" emissiveIntensity={hovered ? 0.5 : 0.2} />
            </mesh>
            <mesh position={[0.3, 0, 0]}>
              <sphereGeometry args={[0.3, 8, 8, 0, Math.PI]} />
              <meshStandardMaterial color="#FF69B4" emissive="#FF1493" emissiveIntensity={hovered ? 0.5 : 0.2} />
            </mesh>
          </group>
        );
      case 'books':
        return (
          <mesh ref={meshRef} position={position}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <boxGeometry args={[0.5, 0.7, 0.15]} />
            <meshStandardMaterial color="#4ECDC4" emissive="#4ECDC4" emissiveIntensity={hovered ? 0.5 : 0.2} />
          </mesh>
        );
      default:
        return null;
    }
  };

  return (
    <group>
      {getShape()}
      {hovered && (
        <Text
          position={[position[0], position[1] + 1.5, position[2]]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          ₹{item.amount}
        </Text>
      )}
    </group>
  );
}

// 3D Garden Path
function GardenPath({ timelineLength }) {
  const pathRef = useRef();

  useFrame(() => {
    if (pathRef.current) {
      pathRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={pathRef}>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
        <planeGeometry args={[2, timelineLength * 2 + 5]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

export default function TimelineGarden({ user, onLogout }) {
  const navigate = useNavigate();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    const userId = user?.id;
    try {
      const response = await axios.get(`http://localhost:5000/api/transactions/user/${userId}`);
      setTimeline(response.data.transactions || []);
      console.log(response.data.transactions);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
        <div className="text-white text-2xl">Loading your garden...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 overflow-hidden">
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <spotLight position={[0, 15, 0]} angle={0.5} penumbra={1} intensity={1} color="#90EE90" />
          
          <Suspense fallback={null}>
            <GardenPath timelineLength={timeline.length} />
            
            {timeline.map((item, index) => {
              const z = -index * 2;
              const x = Math.sin(index * 0.5) * 2;
              return (
                <TimelineItem3D
                  key={item.donation_id}
                  item={item}
                  position={[x, 0, z]}
                  index={index}
                />
              );
            })}
          </Suspense>
          
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            maxDistance={30}
            minDistance={5}
          />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
              Your Garden of Hope 🌳
            </h1>
            <p className="text-gray-300 mt-1">
              {timeline.length} donation{timeline.length !== 1 ? 's' : ''} planted
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/hub')}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              data-testid="back-to-hub-btn"
            >
              ← Back to Hub
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

        {/* Timeline List */}
        <div className="glass rounded-2xl p-6 max-w-2xl max-h-[500px] overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk' }}>
            Donation History
          </h2>
          
          {timeline.length === 0 ? (
            <div className="text-center py-12 text-gray-300">
              <p className="text-xl mb-4">Your garden is waiting to bloom</p>
              <Button
                onClick={() => navigate('/hub')}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                data-testid="make-first-donation-btn"
              >
                Make Your First Donation 🌱
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {timeline.map((item, index) => (
                <div
                  key={item.donation_id}
                  className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                  data-testid={`timeline-item-${index}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-semibold">
                        {item.visual_type === 'tree' && '🌳'}
                        {item.visual_type === 'butterfly' && '🦋'}
                        {item.visual_type === 'books' && '📚'}
                        {' '}{item.charity_name}
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        {new Date(item.timestamp).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="text-white font-bold text-xl">
                      ₹{item.amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total Impact */}
        {timeline.length > 0 && (
          <div className="glass rounded-2xl p-6 max-w-2xl mt-6">
            <div className="text-center">
              <div className="text-gray-300 text-sm mb-2">Total Impact</div>
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">
                ₹{timeline.reduce((sum, item) => sum + item.amount, 0)}
              </div>
              <div className="text-gray-300 text-sm mt-2">
                Hope Points Earned: {user.hope_points} ✨
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audio Recorder Modal */}
      {showAudioRecorder && selectedItem && (
        <AudioRecorder
          donationId={selectedItem.donation_id}
          userId={user.id}
          onClose={() => setShowAudioRecorder(false)}
        />
      )}
    </div>
  );
}