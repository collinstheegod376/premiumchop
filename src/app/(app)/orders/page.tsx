"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PackageOpen, CheckCircle2, Clock, RefreshCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { OrderCard } from "@/components/dashboard/OrderCard";
import type { OrderStatus } from "@/types";

const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "payment_made", label: "Payment Made" },
  { key: "processing", label: "Processing" },
  { key: "payment_received", label: "Payment Received" },
  { key: "delivered", label: "Delivered" },
];

export default function OrdersPage() {
  const { user } = useAuth();
  const { orders, loading, refetch } = useOrders(user?.id);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const searchParams = useSearchParams();
  const successId = searchParams.get("success");

  const filtered = orders.filter((o) => {
    if (filter === "pending") return o.status !== "delivered";
    if (filter === "completed") return o.status === "delivered";
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold dark:text-white text-dark-900">My Orders</h1>
          <p className="text-secondary mt-1">Track all your purchases</p>
        </div>
        <button onClick={refetch} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCcw size={15} /> Refresh
        </button>
      </div>

      {/* Success banner */}
      <AnimatePresence>
        {successId && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-6 p-4 rounded-xl flex items-center gap-3 border border-emerald-500/30 bg-emerald-500/10">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-400">Order Placed Successfully!</p>
              <p className="text-xs text-emerald-400/70 mt-0.5">We will process your order shortly. Track it below.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "completed"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${
              filter === f ? "bg-gold-500 text-dark-950" : "dark:bg-dark-800 bg-white border dark:border-dark-700 border-gray-200 text-secondary hover:border-gold-500/30"
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <PackageOpen size={48} className="mx-auto mb-4 text-muted opacity-40" />
          <p className="font-display text-lg dark:text-white text-dark-700 mb-2">No orders yet</p>
          <p className="text-muted text-sm">Your orders will appear here after purchase.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => (
            <OrderCard key={order.id} order={order} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
