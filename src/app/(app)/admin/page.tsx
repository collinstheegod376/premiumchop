"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, RefreshCcw, ExternalLink, ChevronDown, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import type { Order, OrderStatus } from "@/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";
import { formatNaira, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<"all"|"pending"|"completed">("all");
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const supabase = createClient();

  useEffect(() => { if (!loading && (!user || !isAdmin)) router.push("/shop"); }, [user, isAdmin, loading, router]);

  const fetchOrders = useCallback(async () => {
    setFetching(true);
    const { data } = await supabase.from("orders").select("*, product:products(*), user:users(*)").order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
    setFetching(false);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders();
    const channel = supabase.channel("admin-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => {
        setNewOrderCount((n) => n + 1);
        toast("🛎 New order received!");
        fetchOrders();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin, fetchOrders]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", orderId);
    if (!error) {
      await supabase.from("order_status_history").insert({ order_id: orderId, status });
      toast.success(`Status → "${STATUS_LABELS[status]}"`);
      fetchOrders();
    }
  }

  const filtered = orders.filter((o) => filter === "pending" ? o.status !== "delivered" : filter === "completed" ? o.status === "delivered" : true);
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status !== "delivered").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    revenue: orders.reduce((s, o) => s + o.total_amount, 0),
  };

  if (loading || !isAdmin) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={22} className="text-gold-500" />
            <h1 className="font-display text-3xl font-bold dark:text-white text-dark-900">Admin Panel</h1>
            {newOrderCount > 0 && <span className="badge bg-red-500/10 text-red-400 animate-pulse">{newOrderCount} new</span>}
          </div>
          <p className="text-secondary">Manage all orders and track payments</p>
        </div>
        <button onClick={() => { fetchOrders(); setNewOrderCount(0); }} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCcw size={15} />Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", value: stats.total, color: "text-blue-400" },
          { label: "Pending", value: stats.pending, color: "text-yellow-400" },
          { label: "Delivered", value: stats.delivered, color: "text-emerald-400" },
          { label: "Revenue", value: formatNaira(stats.revenue), color: "text-gold-400" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card p-4">
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Filter size={16} className="text-muted" />
        {(["all","pending","completed"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter === f ? "bg-gold-500 text-dark-950" : "dark:bg-dark-800 bg-white border dark:border-dark-700 border-gray-200 text-secondary"}`}>
            {f}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted">{filtered.length} orders</span>
      </div>

      {fetching ? (
        <div className="space-y-3">{Array.from({length:4}).map((_,i) => <div key={i} className="card p-5 h-20 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center"><p className="text-muted">No orders found</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => (
            <AdminOrderRow key={order.id} order={order} index={i}
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
              onUpdateStatus={updateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div><p className="text-xs text-muted mb-0.5">{label}</p><p className="dark:text-white text-dark-800 font-medium text-sm capitalize">{value || "—"}</p></div>
  );
}

function AdminOrderRow({ order, index, expanded, onToggle, onUpdateStatus }: {
  order: Order; index: number; expanded: boolean;
  onToggle: () => void; onUpdateStatus: (id: string, s: OrderStatus) => void;
}) {
  const statuses = ["payment_made","processing","payment_received","delivered"] as OrderStatus[];
  const currentIdx = statuses.indexOf(order.status);
  const nextStatus = statuses[currentIdx + 1];
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="card overflow-hidden">
      <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={onToggle}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted">{order.id.slice(0,8)}</span>
            <span className="font-semibold dark:text-white text-dark-900 text-sm">{(order as any).product_name || order.product?.name || "—"}</span>
            <span className={`badge text-xs ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted flex-wrap">
            <span>{order.full_name}</span><span>•</span>
            <span>{formatDate(order.created_at)}</span><span>•</span>
            <span className="text-gold-500 font-semibold">{formatNaira(order.total_amount)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {nextStatus && (
            <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, nextStatus); }} className="btn-primary py-1.5 px-3 text-xs">
              → {STATUS_LABELS[nextStatus]}
            </button>
          )}
          <motion.div animate={{ rotate: expanded ? 180 : 0 }}><ChevronDown size={18} className="text-muted" /></motion.div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t space-y-4" style={{ borderColor: "var(--border-color)" }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                <Detail label="Full Name" value={order.full_name} />
                {order.contact_info && <Detail label="Contact" value={order.contact_info} />}
                {order.platform_username && <Detail label="Username" value={order.platform_username} />}
                {order.platform_password && <Detail label="Password" value={order.platform_password} />}
                <Detail label="Amount" value={formatNaira(order.total_amount)} />
                <Detail label="Category" value={((order as any).product_category || "").replace("_"," ")} />
              </div>
              {order.proof_of_payment_url && (
                <div>
                  <p className="text-xs text-muted mb-2">Proof of Payment</p>
                  <a href={order.proof_of_payment_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-gold-500 hover:text-gold-400 border border-gold-500/20 px-3 py-1.5 rounded-lg">
                    <ExternalLink size={13} />View Payment Screenshot
                  </a>
                </div>
              )}
              <div>
                <p className="text-xs text-muted mb-2">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {statuses.map((s) => (
                    <button key={s} onClick={() => onUpdateStatus(order.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${order.status === s ? "bg-gold-500 text-dark-950" : "dark:bg-dark-700 bg-gray-100 text-secondary border border-transparent hover:border-gold-500/30"}`}>
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
