import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FloatingShape from "../auth/FloatingShape.jsx";

const EmailVerificationPage = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // ADD THIS
    const API = import.meta.env.VITE_API_URL;

    // CHANGE FETCH
    const response = await fetch(`${API}/api/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code }),
    });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid verification code");
      }

      console.log("Verification successful:", data);
      navigate("/"); // Navigate to Home Page on success

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center relative overflow-hidden">
      
      {/* Background Bubbles */}
      <FloatingShape color="bg-green-500" size="w-64 h-64" top="-5%" left="10%" delay={0} />
      <FloatingShape color="bg-emerald-500" size="w-48 h-48" top="70%" left="80%" delay={5} />
      <FloatingShape color="bg-lime-400" size="w-32 h-32" top="40%" left="-10%" delay={2} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl z-10"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">Verify Your Email</h2>
        <p className="text-gray-300 mb-6 text-center">
          Enter the 6-digit code sent to your email address.
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          
          {/* Simple Single Input Field */}
          <div>
            <input
              type="text"
              placeholder="Enter Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white text-center text-xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm font-semibold text-center">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:shadow-green-500/40 transition-all"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;