"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      await supabase.from("users").upsert({
        id: data.user.id, email, full_name: fullName, role: "user",
      });
      toast.success("Account created! Welcome.");
      router.push("/shop");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-2xl p-8 border border-dark-700"
          style={{ background: "#111820" }}>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center"
              style={{ boxShadow: "0 4px 16px rgba(245,158,11,0.4)" }}>
              <Zap size={20} className="text-dark-950" />
            </div>
            <span className="font-display text-xl font-bold text-white">PremiumStore</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-dark-400 text-sm mb-7">Fill in your details to get started</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-dark-700 bg-dark-900 text-white placeholder-dark-500 focus:outline-none focus:border-gold-500/60 focus:ring-2 focus:ring-gold-500/20 transition-all"
                placeholder="John Doe" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-dark-700 bg-dark-900 text-white placeholder-dark-500 focus:outline-none focus:border-gold-500/60 focus:ring-2 focus:ring-gold-500/20 transition-all"
                placeholder="you@example.com" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-dark-700 bg-dark-900 text-white placeholder-dark-500 focus:outline-none focus:border-gold-500/60 focus:ring-2 focus:ring-gold-500/20 transition-all"
                  placeholder="Min. 6 characters" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Confirm Password</label>
              <input type="password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-dark-700 bg-dark-900 text-white placeholder-dark-500 focus:outline-none focus:border-gold-500/60 focus:ring-2 focus:ring-gold-500/20 transition-all"
                placeholder="Repeat password" required />
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-semibold text-dark-950 bg-gold-500 hover:bg-gold-400 transition-all mt-2 disabled:opacity-50"
              style={{ boxShadow: "0 4px 16px rgba(245,158,11,0.3)" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Create Account"}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-dark-400 text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-gold-400 font-semibold hover:text-gold-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}