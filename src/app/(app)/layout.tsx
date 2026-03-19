"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, ShoppingBag, LayoutDashboard, ClipboardList,
  Settings, ShieldCheck, Menu, X, LogOut, Bell
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

const NAV = [
  { href: "/shop",      label: "Shop",      icon: ShoppingBag    },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders",    label: "My Orders", icon: ClipboardList   },
  { href: "/settings",  label: "Settings",  icon: Settings        },
];

function SidebarInner({ links, pathname, user, onSignOut, onClose }: {
  links: typeof NAV; pathname: string;
  user: any; onSignOut: () => void; onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="flex items-center justify-between mb-8 px-2">
        <Link href="/shop" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0"
            style={{ boxShadow: "0 4px 14px rgba(245,158,11,0.4)" }}>
            <Zap size={17} className="text-dark-950" />
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-none" style={{ color: "var(--text-primary)" }}>PremiumStore</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Digital Marketplace</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="btn-ghost p-1.5 lg:hidden">
            <X size={17} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`sidebar-link ${pathname.startsWith(href) ? "active" : ""}`}>
            <Icon size={17} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* User + sign out */}
      <div className="pt-4 mt-4" style={{ borderTop: "1px solid var(--border-color)" }}>
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)" }}>
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <span className="text-amber-400 text-xs font-bold">
              {user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {user?.user_metadata?.full_name || "User"}
            </p>
            <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
          </div>
        </div>
        <button onClick={onSignOut}
          className="sidebar-link w-full text-red-400 hover:bg-red-500/8 hover:text-red-300">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const supabase = createClient();

  useEffect(() => { if (!loading && !user) router.push("/auth/login"); }, [user, loading]);
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/auth/login");
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center animate-pulse">
          <Zap size={22} className="text-dark-950" />
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>
      </div>
    </div>
  );
  if (!user) return null;

  const allLinks = isAdmin
    ? [...NAV, { href: "/admin", label: "Admin Panel", icon: ShieldCheck }]
    : NAV;

  const pageTitle = allLinks.find(l => pathname.startsWith(l.href))?.label || "PremiumStore";

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -270 }} animate={{ x: 0 }} exit={{ x: -270 }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed top-0 left-0 h-full w-[256px] z-50 lg:hidden"
            style={{ background: "var(--bg-card)", borderRight: "1px solid var(--border-color)" }}>
            <SidebarInner links={allLinks} pathname={pathname} user={user}
              onSignOut={handleSignOut} onClose={() => setSidebarOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[232px] shrink-0 sticky top-0 h-screen"
        style={{ background: "var(--bg-card)", borderRight: "1px solid var(--border-color)" }}>
        <SidebarInner links={allLinks} pathname={pathname} user={user} onSignOut={handleSignOut} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-6 py-3.5"
          style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-color)" }}>
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-2 lg:hidden">
            <Menu size={19} />
          </button>
          <h1 className="hidden lg:block font-display font-semibold text-base" style={{ color: "var(--text-primary)" }}>
            {pageTitle}
          </h1>
          <div className="flex items-center gap-2 ml-auto">
            <button className="btn-ghost p-2 relative">
              <Bell size={17} />
            </button>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
