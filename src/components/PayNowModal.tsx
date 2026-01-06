import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { initiatePayment, verifyPaymentStatus } from "../services/payment";
import { useAppDispatch } from "../redux/store";
import { loadUser } from "../redux/slices/authSlice";
import { notify } from "./ToastNotification";

// Declare PayHere on window object
declare global {
  interface Window {
    payhere: any;
  }
}

interface PayNowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PayNowModal({ isOpen, onClose }: PayNowModalProps) {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  // Load PayHere Script dynamically
  useEffect(() => {
    if (isOpen && !window.payhere) {
      const script = document.createElement("script");
      script.src = "https://www.payhere.lk/lib/payhere.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Get Payment Details from Backend
      const paymentData = await initiatePayment();

      const config = {
      ...paymentData,
      return_url: undefined,
      cancel_url: undefined,
    };

      // Configure PayHere
      window.payhere.onCompleted = async function (orderId: string) {
      console.log("Payment completed. OrderID:" + orderId);
      
      try {
        await verifyPaymentStatus(orderId);
        
        notify.success("Payment Successful! License Activated.");
        
        await dispatch(loadUser());
        
        onClose();
      } catch (err) {
        notify.error("Payment successful but failed to update status. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

      window.payhere.onDismissed = function () {
        console.log("Payment dismissed");
        setLoading(false);
      };

      window.payhere.onError = function (error: string) {
        console.log("Error:" + error);
        notify.error("Payment Error: " + error);
        setLoading(false);
      };

      // Open PayHere Popup
      window.payhere.startPayment(config);

    } catch (error) {
      console.error(error);
      notify.error("Failed to initiate payment");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative ${
              theme === "dark" ? "bg-gray-800 text-white border border-gray-700" : "bg-white text-gray-900"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 opacity-70" />
            </button>

            {/* Header / Banner */}
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold">Activate Your License</h2>
              <p className="text-blue-100 mt-2 text-sm">One-time payment for lifetime access</p>
            </div>

            {/* Body */}
            <div className="p-8">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-medium text-lg">MediCore Premium</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lifetime Validity</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">Rs. 20,000</p>
                  <p className="text-xs text-gray-400">LKR</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm opacity-80">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">✓</div>
                  <span>Unlimited Patient Records</span>
                </div>
                <div className="flex items-center gap-3 text-sm opacity-80">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">✓</div>
                  <span>Full Clinic Management Suite</span>
                </div>
                <div className="flex items-center gap-3 text-sm opacity-80">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">✓</div>
                  <span>24/7 Technical Support</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" /> Pay Now
                  </>
                )}
              </button>
              
              <div className="mt-4 text-center">
                 <p className="text-xs text-gray-400">Secured by PayHere. Supports Visa, MasterCard, Genie & more.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}