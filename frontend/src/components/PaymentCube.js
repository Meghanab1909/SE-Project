import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, OrbitControls, Text } from '@react-three/drei';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Rotating QR Cube (keep existing code)
function QRCube({ qrData, isPaying }) {
  const meshRef = useRef();
  const [hoveredFace, setHoveredFace] = useState(null);

  useFrame((state) => {
    if (meshRef.current) {
      if (!hoveredFace) {
        meshRef.current.rotation.y += 0.01;
      }
      
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
  const [upiId, setUpiId] = useState('');
  const [pin, setPin] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    generatePayment();
  }, []);

  const generatePayment = async () => {
    try {
      const response = await axios.post(`${API}/payment/generate-upi`, {
        donation_id: donation.id,
        amount: donation.amount
      });
      setPaymentData({
      ...response.data,
      amount: donation.amount, // ✅ preserve amount in paymentData
    });
    } catch (error) {
      toast.error('Failed to generate payment');
      console.error('Payment generation error:', error);
    }
  };

  const verifyPayment = async () => {
    if (!upiId || !pin) {
      toast.error('Please enter UPI ID and PIN');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await axios.post("http://localhost:5000/api/payment/verify", {
        donation_id: donation.id,
        payment_id: paymentData.payment_id,
        upi_id: upiId,
        pin: pin,
        amount: paymentData.amount
      });
      
      if (response.data.success) {
        toast.success('Payment successful! 🎉');
        setTimeout(() => {
          onComplete();
        }, 1000);
      } else {
        toast.error(response.data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl h-[600px] mx-4">
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
                {isVerifying ? 'Processing payment...' : 'Rotate to explore payment options'}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="glass rounded-2xl p-6 flex flex-col overflow-y-auto">
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Complete Payment
            </h2>
            
            <div className="space-y-4 flex-1">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-gray-300 text-sm">Amount</div>
                <div className="text-white text-3xl font-bold">₹{donation.amount}</div>
              </div>

              {!showPaymentForm ? (
                <>
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

                  <Button
                    onClick={() => setShowPaymentForm(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl"
                  >
                    Pay with UPI 💳
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        UPI ID
                      </label>
                      <Input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="w-full bg-white/10 border-white/20 text-white"
                        data-testid="upi-id-input"
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        UPI PIN
                      </label>
                      <Input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="Enter 4-digit PIN"
                        maxLength={4}
                        className="w-full bg-white/10 border-white/20 text-white"
                        data-testid="upi-pin-input"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowPaymentForm(false)}
                      variant="outline"
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={verifyPayment}
                      disabled={isVerifying}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                      data-testid="verify-payment-btn"
                    >
                      {isVerifying ? 'Processing...' : 'Confirm Payment ✓'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}