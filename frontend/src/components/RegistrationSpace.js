import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Animated 3D Sphere
function AnimatedSphere({ emotion }) {
  const meshRef = useRef();
  
  // Color based on emotion
  const getEmotionColor = () => {
    switch(emotion) {
      case 'happy': return '#FFD93D';
      case 'neutral': return '#4ECDC4';
      case 'surprised': return '#FF6B9D';
      default: return '#9D4EDD';
    }
  };

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[2, 64, 64]} scale={1.2}>
        <MeshDistortMaterial
          color={getEmotionColor()}
          attach="material"
          distort={0.5}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

// Particles for background
function Particles() {
  const count = 200;
  const particlesRef = useRef();

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const particles = Array.from({ length: count }, (_, i) => {
    const x = (Math.random() - 0.5) * 50;
    const y = (Math.random() - 0.5) * 50;
    const z = (Math.random() - 0.5) * 50;
    return [x, y, z];
  });

  return (
    <group ref={particlesRef}>
      {particles.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export default function RegistrationSpace({ onUserRegistered }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emotion, setEmotion] = useState('neutral');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    loadModels();
    // Auto show form after animation
    setTimeout(() => setShowForm(true), 2000);
  }, []);

  const loadModels = async () => {
    try {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      setModelsLoaded(true);
    } catch (error) {
      console.log('Face detection models not loaded:', error);
      setModelsLoaded(false);
    }
  };

  const startCamera = async () => {
    if (!modelsLoaded) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        detectEmotion();
      }
    } catch (error) {
      console.log('Camera access denied:', error);
      toast.error('Camera access denied');
    }
  };

  const detectEmotion = async () => {
    if (!videoRef.current || !modelsLoaded) return;

    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections) {
      const expressions = detections.expressions;
      const maxExpression = Object.keys(expressions).reduce((a, b) => 
        expressions[a] > expressions[b] ? a : b
      );
      setEmotion(maxExpression);
    }

    setTimeout(() => detectEmotion(), 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${API}/register`, {
        name: name.trim(),
        email: email.trim(),
        emotion
      });

      toast.success('Welcome to MicroSpark! 🌟');
      onUserRegistered(response.data);
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#9D4EDD" />
          <Suspense fallback={null}>
            <AnimatedSphere emotion={emotion} />
            <Particles />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Registration Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div 
          className={`w-full max-w-md transition-all duration-1000 transform ${
            showForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="glass rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk' }}>
                Enter MicroSpark
              </h1>
              <p className="text-gray-300 text-lg">
                Step into the immersive world of giving
              </p>
            </div>

            {/* Hidden video for emotion detection */}
            <video 
              ref={videoRef} 
              width="0" 
              height="0" 
              style={{ display: 'none' }}
              autoPlay 
              muted
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <form onSubmit={handleSubmit} className="space-y-6" data-testid="registration-form">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Your Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                  data-testid="name-input"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                  data-testid="email-input"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="text-white text-sm">Current Mood:</span>
                <span className="text-purple-300 font-medium capitalize">{emotion}</span>
              </div>

              {modelsLoaded && (
                <Button
                  type="button"
                  onClick={startCamera}
                  variant="outline"
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                  data-testid="detect-emotion-btn"
                >
                  🎭 Detect My Emotion
                </Button>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 rounded-xl shadow-lg text-lg"
                data-testid="enter-hopeorb-btn"
              >
                {isSubmitting ? 'Entering...' : 'Enter MicroSpark ✨'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}