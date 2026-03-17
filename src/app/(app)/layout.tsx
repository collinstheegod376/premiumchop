"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShoppingBag, LayoutDashboard, ClipboardList, Settings, ShieldCheck, Menu, X, LogOut, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

const navLinks = [
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "My Orders", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: Settings },
];

function SidebarContent({ links, pathname, user, onSignOut, onClose }: { links: typeof navLinks; pathname: string; user: any; onSignOut: () => void; onClose?: () => void; }) {
  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between mb-8 px-2">
        <Link href="/shop" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gold-500 flex items-center justify-center">
            <Zap size={18} className="text-dark-950" />
          </div>
          <span className="font-display text-lg font-bold dark:text-white text-dark-900">PremiumStore</span>
        </Link>
        {onClose && <button onClick={onClose} className="btn-ghost p-1.5 lg:hidden"><X size={18} /></button>}
      </div>
      <nav className="flex-1 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`sidebar-link ${pathname.startsWith(href) ? "active" : ""}`}>
            <Icon size={18} /><span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t pt-4 mt-4" style={{ borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center shrink-0">
            <span className="text-gold-500 text-xs font-bold">{user?.email?.[0].toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium dark:text-white text-dark-800 truncate">{user?.user_metadata?.full_name || "User"}</p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={onSignOut} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut size={18} /><span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const supabase = createClient();

  useEffect(() => { if (!loading && !user) router.push("/auth/login"); }, [user, loading, router]);
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/auth/login");
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-dark-950 bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center animate-pulse">
          <Zap size={24} className="text-dark-950" />
        </div>
        <p className="text-secondary text-sm">Loading...</p>
      </div>
    </div>
  );
  if (!user) return null;

  const allLinks = isAdmin ? [...navLinks, { href: "/admin", label: "Admin Panel", icon: ShieldCheck }] : navLinks;

  return (
    <div className="min-h-screen flex dark:bg-dark-950 bg-gray-50">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-[260px] z-50 flex flex-col lg:hidden"
            style={{ background: "var(--bg-card)", borderRight: "1px solid var(--border-color)" }}>
            <SidebarContent links={allLinks} pathname={pathname} user={user} onSignOut={handleSignOut} onClose={() => setSidebarOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex flex-col w-[240px] shrink-0 sticky top-0 h-screen"
        style={{ background: "var(--bg-card)", borderRight: "1px solid var(--border-color)" }}>
        <SidebarContent links={allLinks} pathname={pathname} user={user} onSignOut={handleSignOut} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 py-4"
          style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-color)" }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost p-2"><Menu size={20} /></button>
          <div className="hidden lg:block">
            <h1 className="font-display text-lg font-semibold dark:text-white text-dark-900">
              {allLinks.find(l => pathname.startsWith(l.href))?.label || "PremiumStore"}
            </h1>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="btn-ghost p-2"><Bell size={18} /></button>
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
              <span className="text-gold-500 text-xs font-bold">{user.email?.[0].toUpperCase()}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
