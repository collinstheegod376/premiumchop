"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, User, Shield, Save, Check } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user }   = useAuth();
  const supabase   = createClient();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    if (!error) {
      await supabase.from("users").update({ full_name: fullName }).eq("id", user?.id);
      setSaved(true);
      toast.success("Profile updated!");
      setTimeout(() => setSaved(false), 2500);
    } else {
      toast.error("Update failed");
    }
    setSaving(false);
  }

  const sections = [
    {
      title: "Appearance",
      icon: <Sun size={17} className="text-purple-400" />,
      bg: "bg-purple-500/12",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {(["dark","light"] as const).map(t => (
            <motion.button key={t} onClick={() => t !== theme && toggleTheme()}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2.5 transition-all duration-200 ${
                theme === t
                  ? "border-amber-500 bg-amber-500/08"
                  : "border-transparent hover:border-amber-500/30"
              }`}
              style={{ background: theme === t ? "rgba(245,158,11,0.06)" : "var(--bg-secondary)" }}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                t === "dark" ? "bg-dark-900" : "bg-white"
              }`} style={{ border: "1px solid var(--border-color)" }}>
                {t === "dark"
                  ? <Moon size={20} className="text-amber-400" />
                  : <Sun  size={20} className="text-yellow-500" />}
              </div>
              <span className={`text-sm font-semibold capitalize ${
                theme === t ? "text-amber-400" : ""
              }`} style={{ color: theme === t ? undefined : "var(--text-secondary)" }}>
                {t} Mode
              </span>
              {theme === t && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/12 px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              )}
            </motion.button>
          ))}
        </div>
      ),
    },
    {
      title: "Profile",
      icon: <User size={17} className="text-blue-400" />,
      bg: "bg-blue-500/12",
      content: (
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              className="input-field" placeholder="Your full name" />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input type="email" value={user?.email || ""} disabled
              className="input-field opacity-50 cursor-not-allowed" />
            <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>Email cannot be changed here</p>
          </div>
          <motion.button type="submit" disabled={saving}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2">
            {saving
              ? <span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
              : saved
              ? <Check size={16} />
              : <Save size={16} />}
            {saved ? "Saved!" : "Save Changes"}
          </motion.button>
        </form>
      ),
    },
    {
      title: "Account Info",
      icon: <Shield size={17} className="text-emerald-400" />,
      bg: "bg-emerald-500/12",
      content: (
        <div className="space-y-3 text-sm">
          {[
            { label: "Account ID", value: <span className="font-mono text-xs">{user?.id?.slice(0,20)}…</span> },
            { label: "Member Since", value: user?.created_at
                ? new Date(user.created_at).toLocaleDateString("en-NG", { month: "long", year: "numeric" })
                : "—" },
            { label: "Email Verified", value: user?.email_confirmed_at ? "✅ Yes" : "❌ No" },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center py-2.5"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-muted)" }}>{row.label}</span>
              <span className="font-medium" style={{ color: "var(--text-primary)" }}>{row.value}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Manage your account and preferences</p>
      </motion.div>

      <div className="space-y-4">
        {sections.map((sec, i) => (
          <motion.div key={sec.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="card-flat p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-9 h-9 rounded-xl ${sec.bg} flex items-center justify-center`}>
                {sec.icon}
              </div>
              <h2 className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>{sec.title}</h2>
            </div>
            {sec.content}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
