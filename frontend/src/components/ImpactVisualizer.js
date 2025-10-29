import { useEffect, useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import * as THREE from 'three';

// Tree Growth Animation
function GrowingTree() {
  const groupRef = useRef();
  const [scale, setScale] = useState(0);

  useFrame(() => {
    if (scale < 1) {
      setScale(s => Math.min(s + 0.02, 1));
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Foliage */}
      <mesh position={[0, 2, 0]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      <mesh position={[0, 2.8, 0]}>
        <coneGeometry args={[0.8, 1.5, 8]} />
        <meshStandardMaterial color="#32CD32" />
      </mesh>
      <mesh position={[0, 3.4, 0]}>
        <coneGeometry args={[0.6, 1, 8]} />
        <meshStandardMaterial color="#7CFC00" />
      </mesh>
    </group>
  );
}

// Flying Butterflies
function Butterflies() {
  const butterflies = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 10,
    y: Math.random() * 5,
    z: (Math.random() - 0.5) * 10,
    speed: 0.5 + Math.random() * 0.5
  }));

  return (
    <>
      {butterflies.map((butterfly) => (
        <Butterfly key={butterfly.id} {...butterfly} />
      ))}
    </>
  );
}

function Butterfly({ x, y, z, speed }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = x + Math.sin(state.clock.elapsedTime * speed) * 3;
      meshRef.current.position.y = y + Math.sin(state.clock.elapsedTime * speed * 2) * 2;
      meshRef.current.position.z = z + Math.cos(state.clock.elapsedTime * speed) * 3;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Left wing */}
      <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
        <sphereGeometry args={[0.3, 8, 8, 0, Math.PI]} />
        <meshStandardMaterial color="#FF69B4" emissive="#FF1493" emissiveIntensity={0.3} />
      </mesh>
      {/* Right wing */}
      <mesh position={[0.3, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <sphereGeometry args={[0.3, 8, 8, 0, Math.PI]} />
        <meshStandardMaterial color="#FF69B4" emissive="#FF1493" emissiveIntensity={0.3} />
      </mesh>
      {/* Body */}
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

// Floating Books
function FloatingBooks() {
  const books = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return {
      id: i,
      x: Math.cos(angle) * 3,
      y: 1 + i * 0.3,
      z: Math.sin(angle) * 3,
      color: ['#FF6B9D', '#4ECDC4', '#FFD93D', '#9D4EDD'][i % 4]
    };
  });

  return (
    <>
      {books.map((book) => (
        <Book key={book.id} {...book} />
      ))}
    </>
  );
}

function Book({ x, y, z, color }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.y = y + Math.sin(state.clock.elapsedTime + x) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[x, y, z]}>
      <boxGeometry args={[0.5, 0.7, 0.15]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default function ImpactVisualizer({ charity, amount, onClose }) {
  const [showCelebration, setShowCelebration] = useState(true);

  useEffect(() => {
    // Auto close after 10 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getVisualization = () => {
    switch (charity?.visual_type) {
      case 'tree':
        return <GrowingTree />;
      case 'butterfly':
        return <Butterflies />;
      case 'books':
        return <FloatingBooks />;
      default:
        return <GrowingTree />;
    }
  };

  const getMessage = () => {
    switch (charity?.visual_type) {
      case 'tree':
        return 'A tree of hope grows from your kindness 🌳';
      case 'butterfly':
        return 'Your love sets butterflies free 🦋';
      case 'books':
        return 'Knowledge floats on wings of generosity 📚';
      default:
        return 'Your donation creates ripples of change ✨';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full h-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          data-testid="close-impact-btn"
        >
          <X size={28} />
        </button>

        {/* 3D Visualization */}
        <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, 5, -10]} intensity={0.5} color="#9D4EDD" />
          <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={1} />
          
          <Suspense fallback={null}>
            {getVisualization()}
          </Suspense>
          
          <OrbitControls enableZoom={true} enablePan={false} />
        </Canvas>

        {/* Overlay Message */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className={`glass rounded-3xl p-8 max-w-2xl mx-4 text-center transition-all duration-1000 ${
            showCelebration ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}>
            <h2 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Impact Created! 🎉
            </h2>
            <p className="text-2xl text-gray-200 mb-6">
              {getMessage()}
            </p>
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              ₹{amount}
            </div>
            <p className="text-gray-300 mt-4">
              Your contribution to {charity?.name}
            </p>
            
            <div className="mt-6 pointer-events-auto">
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl"
                data-testid="continue-btn"
              >
                Continue ✨
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}