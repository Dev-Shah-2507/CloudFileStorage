import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import FloatingShape from "../auth/FloatingShape.jsx";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // ADD THIS
     const API = import.meta.env.VITE_API_URL;
     
     // CHANGE FETCH
     const response = await fetch(`${API}/api/auth/login`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       credentials: "include",
       body: JSON.stringify({ email, password }),
     });     

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error logging in");
      }

      console.log("Login successful:", data);
      navigate("/"); 

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center relative overflow-hidden">
      
      <FloatingShape color="bg-green-500" size="w-64 h-64" top="-5%" left="10%" delay={0} />
      <FloatingShape color="bg-emerald-500" size="w-48 h-48" top="70%" left="80%" delay={5} />
      <FloatingShape color="bg-lime-400" size="w-32 h-32" top="40%" left="-10%" delay={2} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl z-10"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">Welcome Back</h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-end mt-2">
              <Link to="/ForgotPassword" className="text-sm text-green-400 hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-semibold text-center">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:shadow-green-500/40 transition-all flex justify-center items-center"
            type="submit"
            disabled={isLoading}
          >
             {isLoading ? <Loader className="animate-spin size-5" /> : "Login"}
          </motion.button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-green-400 hover:underline hover:text-green-300 font-semibold">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;