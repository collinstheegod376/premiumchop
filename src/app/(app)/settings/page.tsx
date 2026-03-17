"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, User, Bell, Shield, Save } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const supabase = createClient();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [saving, setSaving] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    if (!error) {
      await supabase.from("users").update({ full_name: fullName }).eq("id", user?.id);
      toast.success("Profile updated!");
    } else {
      toast.error("Failed to update profile");
    }
    setSaving(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold dark:text-white text-dark-900">Settings</h1>
        <p className="text-secondary mt-1">Manage your account and preferences</p>
      </motion.div>

      <div className="space-y-5">
        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Sun size={18} className="text-purple-400" />
            </div>
            <h2 className="font-display font-semibold dark:text-white text-dark-900">Appearance</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["dark", "light"] as const).map((t) => (
              <motion.button
                key={t}
                onClick={() => t !== theme && toggleTheme()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  theme === t ? "border-gold-500 bg-gold-500/10" : "border-transparent dark:bg-dark-800 bg-gray-100"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  t === "dark" ? "bg-dark-900 border border-dark-700" : "bg-white border border-gray-200"
                }`}>
                  {t === "dark" ? <Moon size={18} className="text-gold-400" /> : <Sun size={18} className="text-yellow-500" />}
                </div>
                <span className={`text-sm font-medium capitalize ${theme === t ? "text-gold-500" : "text-secondary"}`}>{t} Mode</span>
                {theme === t && <span className="text-xs text-gold-500/70">Active</span>}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <User size={18} className="text-blue-400" />
            </div>
            <h2 className="font-display font-semibold dark:text-white text-dark-900">Profile</h2>
          </div>
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="input-field" placeholder="Your full name" />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" value={user?.email || ""} disabled
                className="input-field opacity-60 cursor-not-allowed" />
              <p className="text-xs text-muted mt-1">Email cannot be changed</p>
            </div>
            <motion.button type="submit" disabled={saving} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="btn-primary flex items-center gap-2">
              {saving ? <span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" /> : <Save size={16} />}
              Save Changes
            </motion.button>
          </form>
        </motion.div>

        {/* Account info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Shield size={18} className="text-emerald-400" />
            </div>
            <h2 className="font-display font-semibold dark:text-white text-dark-900">Account Info</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: "var(--border-color)" }}>
              <span className="text-secondary text-sm">Account ID</span>
              <span className="font-mono text-xs dark:text-white text-dark-800 truncate max-w-[180px]">{user?.id}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-secondary text-sm">Member Since</span>
              <span className="text-sm dark:text-white text-dark-800">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-NG", { month: "long", year: "numeric" }) : "—"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
