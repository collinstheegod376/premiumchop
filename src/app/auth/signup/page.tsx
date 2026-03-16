"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Zap, CheckCircle2 } from "lucide-react";
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
      email, password, options: { data: { full_name: fullName } },
    });
    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      await supabase.from("users").upsert({ id: data.user.id, email, full_name: fullName, role: "user" });
      toast.success("Account created! Welcome to PremiumStore.");
      router.push("/shop");
      router.refresh();
    }
    setLoading(false);
  }

  const perks = ["Instant digital delivery","Secure payment processing","24/7 order tracking","Premium customer support"];

  return (
    <div className="min-h-screen flex dark:bg-dark-950 bg-gray-50 overflow-hidden">
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative p-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #080c11 0%, #111820 40%, #1a2332 100%)" }}>
        <div className="absolute top-[-100px] right-[-60px] w-[350px] h-[350px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }} />
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center"><Zap size={20} className="text-dark-950" /></div>
            <span className="font-display text-xl font-bold text-white">PremiumStore</span>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="relative z-10">
          <h2 className="font-display text-5xl font-bold text-white leading-tight mb-4">
            Join thousands of <span className="block gold-gradient">happy customers</span>
          </h2>
          <p className="text-dark-400 text-lg mb-8">Get access to Nigeria's best digital services marketplace.</p>
          <div className="space-y-3">
            {perks.map((perk, i) => (
              <motion.div key={perk} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-gold-500 shrink-0" />
                <span className="text-dark-300">{perk}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <div className="text-dark-600 text-sm relative z-10">© 2024 PremiumStore. All rights reserved.</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gold-500 flex items-center justify-center"><Zap size={18} className="text-dark-950" /></div>
            <span className="font-display text-lg font-bold dark:text-white text-dark-900">PremiumStore</span>
          </div>
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold dark:text-white text-dark-900 mb-2">Create your account</h1>
            <p className="text-secondary">Start shopping premium digital services today</p>
          </div>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" placeholder="John Doe" required />
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-12" placeholder="Min. 6 characters" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" placeholder="Repeat password" required />
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full text-center mt-2">
              {loading ? (<span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />Creating account...</span>) : "Create Account"}
            </motion.button>
          </form>
          <p className="mt-6 text-center text-secondary text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-gold-500 font-semibold hover:text-gold-400 transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
