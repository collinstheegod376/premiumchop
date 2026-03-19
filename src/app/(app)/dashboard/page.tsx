"use client";
import { motion } from "framer-motion";
import { ShoppingBag, Clock, CheckCircle2, TrendingUp, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { OrderCard } from "@/components/dashboard/OrderCard";
import { formatNaira } from "@/lib/utils";

export default function DashboardPage() {
  const { user }   = useAuth();
  const { orders, loading } = useOrders(user?.id);

  const pending   = orders.filter(o => o.status !== "delivered");
  const completed = orders.filter(o => o.status === "delivered");
  const totalSpent = orders.reduce((s, o) => s + o.total_amount, 0);

  const stats = [
    { label: "Total Orders",  value: orders.length,     icon: ShoppingBag,  color: "text-blue-400",    bg: "bg-blue-500/12"    },
    { label: "Pending",       value: pending.length,    icon: Clock,         color: "text-yellow-400",  bg: "bg-yellow-500/12"  },
    { label: "Completed",     value: completed.length,  icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/12" },
    { label: "Total Spent",   value: formatNaira(totalSpent), icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/12" },
  ];

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "";

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          {firstName ? `Welcome back, ${firstName}!` : "Dashboard"}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Here's an overview of your account activity
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }} className="card-flat p-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={19} className={s.color} />
            </div>
            <p className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {loading ? "—" : s.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Recent Orders
        </h2>
        <Link href="/orders"
          className="flex items-center gap-1 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card-flat p-5 h-20 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="card-flat p-10 text-center">
          <Package size={44} className="mx-auto mb-4 opacity-20" style={{ color: "var(--text-muted)" }} />
          <p className="font-display text-lg mb-1" style={{ color: "var(--text-primary)" }}>No orders yet</p>
          <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
            Start shopping to see your orders here
          </p>
          <Link href="/shop" className="btn-primary">Browse Products</Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {orders.slice(0, 5).map((order, i) => (
            <OrderCard key={order.id} order={order} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
