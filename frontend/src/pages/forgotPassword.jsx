import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import FloatingShape from "../auth/FloatingShape.jsx";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/api/auth/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error sending reset email");
      }

      setIsSubmitted(true);

    } catch (err) {
        console.error(err);
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
        className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            Forgot Password
          </h2>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <p className="text-gray-300 mb-6 text-center">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>

              {error && <p className="text-red-500 text-sm font-semibold mb-4 text-center">{error}</p>}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:shadow-green-500/40 transition-all flex justify-center items-center"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <Loader className="size-6 animate-spin" /> : "Send Reset Link"}
              </motion.button>
            </form>
          ) : (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Mail className="h-8 w-8 text-white" />
              </motion.div>
              <p className="text-gray-300 mb-6">
                If an account exists for <span className="text-green-400 font-bold">{email}</span>, you will receive a password reset link shortly.
              </p>
            </div>
          )}
        </div>

        <div className="px-8 py-4 bg-gray-900/50 flex justify-center border-t border-gray-700">
          <Link to={"/login"} className="text-sm text-green-400 hover:underline flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;