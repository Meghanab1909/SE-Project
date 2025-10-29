import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, OrbitControls, Text } from '@react-three/drei';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Rotating QR Cube
function QRCube({ qrData, isPaying }) {
  const meshRef = useRef();
  const [hoveredFace, setHoveredFace] = useState(null);

  useFrame((state) => {
    if (meshRef.current) {
      if (!hoveredFace) {
        meshRef.current.rotation.y += 0.01;
      }
      
      // Pulse animation when paying
      if (isPaying) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        meshRef.current.scale.set(scale, scale, scale);
      }
    }
  });

  return (
    <Box 
      ref={meshRef} 
      args={[3, 3, 3]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredFace(e.faceIndex);
      }}
      onPointerOut={() => setHoveredFace(null)}
    >
      <meshStandardMaterial 
        color={isPaying ? '#9D4EDD' : '#4ECDC4'}
        emissive={isPaying ? '#9D4EDD' : '#000000'}
        emissiveIntensity={isPaying ? 0.5 : 0}
        metalness={0.8}
        roughness={0.2}
      />
      
      {/* Payment icons on faces */}
      {[0, 1, 2, 3, 4, 5].map((face) => {
        const icons = ['📱 GPay', '🟣 PhonePe', '💳 UPI', '💸 Pay', '✨ QR', '🎲 Scan'];
        return (
          <Text
            key={face}
            position={[
              face === 0 ? 1.51 : face === 1 ? -1.51 : 0,
              face === 2 ? 1.51 : face === 3 ? -1.51 : 0,
              face === 4 ? 1.51 : face === 5 ? -1.51 : 0
            ]}
            rotation={[
              face === 2 ? -Math.PI / 2 : face === 3 ? Math.PI / 2 : 0,
              face === 1 ? Math.PI : 0,
              0
            ]}
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {icons[face]}
          </Text>
        );
      })}
    </Box>
  );
}

export default function PaymentCube({ donation, onClose, onComplete }) {
  const [paymentData, setPaymentData] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    generatePayment();
  }, []);

  const generatePayment = async () => {
    try {
      const response = await axios.post(`${API}/payment/generate-upi`, {
        donation_id: donation.id,
        amount: donation.amount
      });
      setPaymentData(response.data);
      
      // Auto-verify after 3 seconds (mocked)
      setTimeout(() => {
        verifyPayment(response.data.payment_id);
      }, 3000);
    } catch (error) {
      toast.error('Failed to generate payment');
      console.error('Payment generation error:', error);
    }
  };

  const verifyPayment = async (paymentId) => {
    setIsVerifying(true);
    try {
      await axios.post(`${API}/payment/verify`, {
        donation_id: donation.id,
        payment_id: paymentId || paymentData.payment_id
      });
      
      toast.success('Payment verified! 🎉');
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (error) {
      toast.error('Payment verification failed');
      console.error('Payment verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl h-[600px] mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          data-testid="close-payment-btn"
        >
          <X size={24} />
        </button>

        <div className="grid md:grid-cols-2 gap-6 h-full">
          {/* 3D Cube */}
          <div className="relative rounded-2xl overflow-hidden glass">
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#9D4EDD" />
              
              <Suspense fallback={null}>
                <QRCube qrData={paymentData?.qr_data} isPaying={isVerifying} />
              </Suspense>
              
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
            
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-white text-sm">
                {isVerifying ? 'Verifying payment...' : 'Rotate to explore payment options'}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="glass rounded-2xl p-6 flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Complete Payment
            </h2>
            
            <div className="space-y-4 flex-1">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-gray-300 text-sm">Amount</div>
                <div className="text-white text-3xl font-bold">₹{donation.amount}</div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-gray-300 text-sm mb-2">Payment Methods</div>
                <div className="flex gap-2">
                  <div className="px-3 py-2 bg-purple-500/20 rounded-lg text-white text-sm">
                    📱 Google Pay
                  </div>
                  <div className="px-3 py-2 bg-pink-500/20 rounded-lg text-white text-sm">
                    🟣 PhonePe
                  </div>
                  <div className="px-3 py-2 bg-blue-500/20 rounded-lg text-white text-sm">
                    💳 UPI
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {paymentData && (
                <div className="bg-white/5 rounded-xl p-4">
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="text-purple-300 text-sm hover:text-purple-200 mb-2"
                    data-testid="show-qr-btn"
                  >
                    {showQR ? 'Hide' : 'Show'} QR Code
                  </button>
                  
                  {showQR && (
                    <div className="flex justify-center p-4 bg-white rounded-xl">
                      <QRCodeCanvas 
                        value={paymentData.qr_data} 
                        size={200}
                        level="H"
                        data-testid="payment-qr-code"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="text-gray-400 text-xs text-center p-3 bg-yellow-500/10 rounded-lg">
                ⚠️ This is a DEMO. Payment verification is mocked.
              </div>
            </div>

            <Button
              onClick={() => verifyPayment()}
              disabled={isVerifying}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl mt-4"
              data-testid="verify-payment-btn"
            >
              {isVerifying ? 'Verifying...' : 'Simulate Payment ✨'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}