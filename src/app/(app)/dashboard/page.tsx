"use client";
import { motion } from "framer-motion";
import { ShoppingBag, Clock, CheckCircle2, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { OrderCard } from "@/components/dashboard/OrderCard";
import { formatNaira } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { orders, loading } = useOrders(user?.id);

  const pending = orders.filter((o) => o.status !== "delivered");
  const completed = orders.filter((o) => o.status === "delivered");
  const totalSpent = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const recentOrders = orders.slice(0, 5);

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Pending", value: pending.length, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Completed", value: completed.length, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total Spent", value: formatNaira(totalSpent), icon: TrendingUp, color: "text-gold-400", bg: "bg-gold-500/10" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold dark:text-white text-dark-900">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-secondary mt-1">Here's an overview of your activity</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="card p-4">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="font-display text-xl font-bold dark:text-white text-dark-900">{loading ? "—" : stat.value}</p>
            <p className="text-xs text-muted mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold dark:text-white text-dark-900">Recent Orders</h2>
        <Link href="/orders" className="flex items-center gap-1 text-sm text-gold-500 hover:text-gold-400 transition-colors">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card p-5 h-20 animate-pulse" />)}
        </div>
      ) : recentOrders.length === 0 ? (
        <div className="card p-10 text-center">
          <ShoppingBag size={40} className="mx-auto mb-4 text-muted opacity-30" />
          <p className="dark:text-white text-dark-700 font-medium mb-2">No orders yet</p>
          <p className="text-muted text-sm mb-4">Start shopping to see your orders here</p>
          <Link href="/shop" className="btn-primary inline-flex">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentOrders.map((order, i) => <OrderCard key={order.id} order={order} index={i} />)}
        </div>
      )}
    </div>
  );
}
