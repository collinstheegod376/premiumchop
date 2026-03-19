"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink, Clock } from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";
import { formatNaira, formatDate } from "@/lib/utils";

const STATUS_ORDER: OrderStatus[] = ["payment_made","processing","payment_received","delivered"];

export function OrderCard({ order, index = 0 }: { order: Order; index?: number }) {
  const [expanded, setExpanded] = useState(false);
  const currentStep = STATUS_ORDER.indexOf(order.status);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }} className="card-flat overflow-hidden">
      <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              {(order as any).product_name || order.product?.name || "Product"}
            </h3>
            <span className={`badge text-[10px] ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <Clock size={10} /> {formatDate(order.created_at)}
            </span>
            <span className="text-xs font-semibold text-amber-400">{formatNaira(order.total_amount)}</span>
          </div>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />
        </motion.div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid var(--border-color)" }}>
              {/* Progress stepper */}
              <div className="flex items-center mb-5 mt-1">
                {STATUS_ORDER.map((step, i) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                      i <= currentStep
                        ? "bg-amber-400 text-dark-950"
                        : "border-2 text-muted"
                    }`} style={{ borderColor: i <= currentStep ? undefined : "var(--border-color)" }}>
                      {i < currentStep ? "✓" : i + 1}
                    </div>
                    {i < STATUS_ORDER.length - 1 && (
                      <div className="h-0.5 flex-1 mx-1 transition-all"
                        style={{ background: i < currentStep ? "#f59e0b" : "var(--border-color)" }} />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold text-amber-400 mb-4">
                Current: {STATUS_LABELS[order.status]}
              </p>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>Full Name</p>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{order.full_name}</p>
                </div>
                {order.contact_info && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>Contact</p>
                    <p className="font-medium" style={{ color: "var(--text-primary)" }}>{order.contact_info}</p>
                  </div>
                )}
                {order.platform_username && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>Username</p>
                    <p className="font-medium" style={{ color: "var(--text-primary)" }}>{order.platform_username}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>Amount</p>
                  <p className="font-bold text-amber-400">{formatNaira(order.total_amount)}</p>
                </div>
              </div>

              {order.proof_of_payment_url && (
                <a href={order.proof_of_payment_url} target="_blank" rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium">
                  <ExternalLink size={13} /> View Proof of Payment
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
