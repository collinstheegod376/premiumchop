"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Zap, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      router.push("/shop");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex dark:bg-dark-950 bg-gray-50 overflow-hidden">
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 relative p-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #080c11 0%, #111820 40%, #1a2332 100%)" }}
      >
        <div
          className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center">
              <Zap size={20} className="text-dark-950" />
            </div>
            <span className="font-display text-xl font-bold text-white">PremiumStore</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <h2 className="font-display text-5xl font-bold text-white leading-tight mb-6">
            Your gateway to
            <span className="block gold-gradient">premium digital</span>
            services.
          </h2>
          <p className="text-dark-400 text-lg leading-relaxed">
            Access premium subscriptions, verified mobile numbers, and digital
            accounts — all in one secure marketplace.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: "Products", value: "18+" },
              { label: "Orders", value: "500+" },
              { label: "Rating", value: "4.9★" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-4"
                style={{
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.15)",
                }}
              >
                <div className="font-display text-2xl font-bold text-gold-400">
                  {stat.value}
                </div>
                <div className="text-dark-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 text-dark-500 text-sm relative z-10"
        >
          <Star size={14} className="text-gold-500" />
          <span>Trusted by thousands of customers across Nigeria</span>
        </motion.div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gold-500 flex items-center justify-center">
              <Zap size={18} className="text-dark-950" />
            </div>
            <span className="font-display text-lg font-bold dark:text-white text-dark-900">
              PremiumStore
            </span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold dark:text-white text-dark-900 mb-2">
              Welcome back
            </h1>
            <p className="text-secondary">Sign in to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full text-center"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-secondary text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-gold-500 font-semibold hover:text-gold-400 transition-colors"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
