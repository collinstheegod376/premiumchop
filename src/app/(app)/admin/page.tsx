"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Clock, CheckCircle2, TrendingUp, Bell,
  RefreshCcw, ChevronDown, ExternalLink, Filter,
  MoreVertical, CircleDot, ArrowUpRight, Users
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderStatus } from "@/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";
import { formatNaira, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUS_FLOW: OrderStatus[] = ["payment_made","processing","payment_received","delivered"];

const S_DOT: Record<OrderStatus, string> = {
  payment_made:     "bg-yellow-400",
  processing:       "bg-blue-400",
  payment_received: "bg-emerald-400",
  delivered:        "bg-amber-400",
};

function StatCard({ label, value, icon: Icon, color, bg, index }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="card-flat p-5">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
        <Icon size={19} className={color} />
      </div>
      <p className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
      <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
    </motion.div>
  );
}

function OrderRow({ order, onUpdate }: { order: Order; onUpdate: (id: string, s: OrderStatus) => Promise<void> }) {
  const [open,     setOpen]     = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy,     setBusy]     = useState(false);
  const idx        = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[idx + 1];

  async function advance() {
    if (!nextStatus) return;
    setBusy(true);
    await onUpdate(order.id, nextStatus);
    setBusy(false);
  }
  async function setStatus(s: OrderStatus) {
    setMenuOpen(false);
    setBusy(true);
    await onUpdate(order.id, s);
    setBusy(false);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="card-flat overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${S_DOT[order.status]}`} />

        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setOpen(!open)}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              {(order as any).product_name || "Product"}
            </span>
            <span className={`badge text-[10px] ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs flex-wrap" style={{ color: "var(--text-muted)" }}>
            <span>{order.full_name}</span>
            <span>·</span>
            <span className="text-amber-400 font-semibold">{formatNaira(order.total_amount)}</span>
            <span>·</span>
            <span>{formatDate(order.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {nextStatus && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={advance} disabled={busy}
              className="hidden sm:flex btn-primary py-1.5 px-3 text-xs">
              {busy
                ? <span className="w-3 h-3 border border-dark-950/40 border-t-dark-950 rounded-full animate-spin" />
                : <CheckCircle2 size={12} />}
              {STATUS_LABELS[nextStatus]}
            </motion.button>
          )}
          {order.status === "delivered" && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-xl font-semibold">
              <CheckCircle2 size={12} /> Done
            </span>
          )}

          {/* Status dropdown */}
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="btn-ghost w-8 h-8 p-0 rounded-xl" style={{ color: "var(--text-muted)" }}>
              <MoreVertical size={15} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.93, y: -6 }}
                    animate={{ opacity: 1, scale: 1,    y: 0  }}
                    exit={  { opacity: 0, scale: 0.93, y: -6 }}
                    className="absolute right-0 top-10 z-20 w-52 rounded-2xl overflow-hidden shadow-2xl"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-color)" }}>
                    <div className="p-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest px-3 py-2"
                        style={{ color: "var(--text-muted)" }}>Set Status</p>
                      {STATUS_FLOW.map(s => (
                        <button key={s} onClick={() => setStatus(s)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                            order.status === s
                              ? "text-amber-400 bg-amber-500/10"
                              : "hover:bg-white/5"
                          }`}
                          style={{ color: order.status === s ? undefined : "var(--text-secondary)" }}>
                          <div className={`w-2 h-2 rounded-full ${S_DOT[s]}`} />
                          {STATUS_LABELS[s]}
                          {order.status === s && <CheckCircle2 size={12} className="ml-auto text-amber-400" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => setOpen(!open)} className="btn-ghost w-8 h-8 p-0 rounded-xl">
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={15} style={{ color: "var(--text-muted)" }} />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Expandable details */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid var(--border-color)" }}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                <InfoItem label="Order ID"   value={<span className="font-mono text-xs">{order.id.slice(0,12)}…</span>} />
                <InfoItem label="Customer"   value={order.full_name} />
                {order.contact_info       && <InfoItem label="Contact"   value={order.contact_info} />}
                {order.platform_username  && <InfoItem label="Username"  value={order.platform_username} />}
                {order.platform_password  && <InfoItem label="Password"  value={<span className="font-mono">{order.platform_password}</span>} />}
                <InfoItem label="Category" value={<span className="capitalize">{((order as any).product_category || "").replace("_"," ")}</span>} />
              </div>

              {order.proof_of_payment_url && (
                <a href={order.proof_of_payment_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium mb-3">
                  <ExternalLink size={13} /> View Proof of Payment
                </a>
              )}

              {/* Mobile advance button */}
              {nextStatus && (
                <button onClick={advance} disabled={busy}
                  className="sm:hidden btn-primary w-full py-2 text-xs mt-1">
                  {STATUS_LABELS[nextStatus]}
                </button>
              )}

              {/* Progress bar */}
              <div className="flex items-center gap-1.5 mt-3">
                {STATUS_FLOW.map((s, i) => (
                  <div key={s} className="flex items-center gap-1.5 flex-1">
                    <div className={`h-1.5 flex-1 rounded-full transition-all ${
                      i <= idx ? "bg-amber-400" : "bg-dark-700"
                    }`} style={{ background: i <= idx ? undefined : "var(--border-color)" }} />
                  </div>
                ))}
                <span className="text-xs ml-1 shrink-0" style={{ color: "var(--text-muted)" }}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { orders, loading, refetch, updateOrderStatus } = useOrders();
  const [filter,        setFilter]        = useState<"all"|"pending"|"completed">("all");
  const [newOrderCount, setNewOrderCount] = useState(0);
  const router   = useRouter();
  const supabase = createClient();

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      toast.error("Admin access required.");
      router.push("/shop");
    }
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isAdmin, authLoading]);

  // Realtime new order notifications
  useEffect(() => {
    const channel = supabase.channel("admin-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => {
        setNewOrderCount(c => c + 1);
        toast.success("🛍 New order received!", { duration: 6000 });
        refetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (authLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user || !isAdmin) return null;

  const filtered = orders.filter(o => {
    if (filter === "pending")   return o.status !== "delivered";
    if (filter === "completed") return o.status === "delivered";
    return true;
  });

  const revenue = orders.reduce((s, o) => s + o.total_amount, 0);

  const stats = [
    { label: "Total Orders",   value: orders.length,                                    icon: ShoppingBag, color: "text-blue-400",    bg: "bg-blue-500/15",    index: 0 },
    { label: "Pending",        value: orders.filter(o => o.status !== "delivered").length, icon: Clock,       color: "text-yellow-400",  bg: "bg-yellow-500/15",  index: 1 },
    { label: "Completed",      value: orders.filter(o => o.status === "delivered").length, icon: CheckCircle2,color: "text-emerald-400", bg: "bg-emerald-500/15", index: 2 },
    { label: "Total Revenue",  value: formatNaira(revenue),                              icon: TrendingUp,  color: "text-amber-400",   bg: "bg-amber-500/15",   index: 3 },
  ];

  async function handleUpdate(id: string, status: OrderStatus) {
    const ok = await updateOrderStatus(id, status);
    if (ok) toast.success(`Updated to: ${STATUS_LABELS[status]}`);
    else    toast.error("Update failed");
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Admin Panel</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Manage all orders · Real-time updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          {newOrderCount > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-400"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>
              <Bell size={13} /> {newOrderCount} new
            </motion.div>
          )}
          <button onClick={() => { refetch(); setNewOrderCount(0); }}
            className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(s => <StatCard key={s.label} {...s} value={loading ? "—" : s.value} />)}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <Filter size={14} style={{ color: "var(--text-muted)" }} />
        {(["all","pending","completed"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all capitalize ${
              filter === f
                ? "btn-primary py-1.5 px-4"
                : "btn-secondary py-1.5 px-4"
            }`}>
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>
          {filtered.length} order{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-flat p-5 h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={44} className="mx-auto mb-4 opacity-20" style={{ color: "var(--text-muted)" }} />
          <p className="font-display text-lg" style={{ color: "var(--text-secondary)" }}>No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <OrderRow key={order.id} order={order} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
