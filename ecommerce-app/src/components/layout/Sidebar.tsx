"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, ShoppingBag, LayoutDashboard, Package, Settings,
  LogOut, Shield, Menu, X, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";

const navItems = [
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "My Orders", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, signOut } = useAuth();
  const { theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push("/auth/login");
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-surface">
        <Link href="/shop" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 rounded-xl bg-gold-500 flex items-center justify-center shadow-lg" style={{ boxShadow: "0 4px 12px rgba(245,158,11,0.35)" }}>
            <Zap size={18} className="text-dark-950" />
          </div>
          <div>
            <div className="font-display font-bold text-base dark:text-white text-dark-900 leading-tight">PremiumStore</div>
            <div className="text-xs text-muted">Digital Marketplace</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={`sidebar-link ${active ? "active" : ""}`}>
              <Icon size={18} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={14} className="text-gold-500" />}
            </Link>
          );
        })}

        {isAdmin && (
          <Link href="/admin" onClick={() => setMobileOpen(false)}
            className={`sidebar-link ${pathname.startsWith("/admin") ? "active" : ""}`}>
            <Shield size={18} />
            <span className="flex-1">Admin Panel</span>
            {pathname.startsWith("/admin") && <ChevronRight size={14} className="text-gold-500" />}
          </Link>
        )}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-surface">
        {user && (
          <div className="px-4 py-3 rounded-xl mb-2" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}>
            <div className="text-sm font-semibold dark:text-white text-dark-900 truncate">
              {user.user_metadata?.full_name || "User"}
            </div>
            <div className="text-xs text-muted truncate">{user.email}</div>
          </div>
        )}
        <button onClick={handleSignOut}
          className="sidebar-link w-full text-left hover:text-red-400 hover:bg-red-500/5">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 dark:bg-dark-900 bg-white border-r border-surface">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 dark:bg-dark-900/95 bg-white/95 backdrop-blur-md border-b border-surface px-4 py-3 flex items-center justify-between">
        <Link href="/shop" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center">
            <Zap size={16} className="text-dark-950" />
          </div>
          <span className="font-display font-bold text-sm dark:text-white text-dark-900">PremiumStore</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-surface transition-colors dark:text-white text-dark-900">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-dark-950/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 dark:bg-dark-900 bg-white shadow-2xl">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
