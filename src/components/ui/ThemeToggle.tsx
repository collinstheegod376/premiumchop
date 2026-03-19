"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <motion.button onClick={toggleTheme} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      <AnimatedIcon theme={theme} />
    </motion.button>
  );
}

function AnimatedIcon({ theme }: { theme: string }) {
  return (
    <motion.div key={theme} initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}>
      {theme === "dark"
        ? <Moon size={16} className="text-amber-400" />
        : <Sun  size={16} className="text-amber-500" />}
    </motion.div>
  );
}
