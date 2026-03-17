"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink, Clock } from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";
import { formatNaira, formatDate } from "@/lib/utils";

const STATUS_ORDER: OrderStatus[] = ["payment_made", "processing", "payment_received", "delivered"];

export function OrderCard({ order, index = 0 }: { order: Order; index?: number }) {
  const [expanded, setExpanded] = useState(false);
  const currentStep = STATUS_ORDER.indexOf(order.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card overflow-hidden"
    >
      <div
        className="p-5 flex items-center gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold dark:text-white text-dark-900 truncate">
              {(order as any).product_name || order.product?.name || "Product"}
            </h3>
            <span className={`badge ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-muted flex items-center gap-1">
              <Clock size={11} /> {formatDate(order.created_at)}
            </span>
            <span className="text-xs font-semibold text-gold-500">
              {formatNaira(order.total_amount)}
            </span>
          </div>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-muted shrink-0" />
        </motion.div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t" style={{ borderColor: "var(--border-color)" }}>
              {/* Progress steps */}
              <div className="mt-4 mb-4">
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 right-0 top-3 h-0.5 dark:bg-dark-700 bg-gray-200" />
                  <div
                    className="absolute left-0 top-3 h-0.5 bg-gold-500 transition-all duration-500"
                    style={{ width: `${(currentStep / (STATUS_ORDER.length - 1)) * 100}%` }}
                  />
                  {STATUS_ORDER.map((step, i) => (
                    <div key={step} className="relative flex flex-col items-center gap-1.5 z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        i <= currentStep
                          ? "bg-gold-500 border-gold-500 text-dark-950"
                          : "dark:bg-dark-800 bg-gray-100 dark:border-dark-600 border-gray-300 text-muted"
                      }`}>
                        {i < currentStep ? "✓" : i + 1}
                      </div>
                      <span className="text-xs text-muted text-center hidden sm:block" style={{ maxWidth: 60 }}>
                        {STATUS_LABELS[step]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-sm mt-4">
                <div>
                  <p className="text-xs text-muted mb-0.5">Full Name</p>
                  <p className="dark:text-white text-dark-800 font-medium">{order.full_name}</p>
                </div>
                {order.contact_info && (
                  <div>
                    <p className="text-xs text-muted mb-0.5">Contact</p>
                    <p className="dark:text-white text-dark-800 font-medium">{order.contact_info}</p>
                  </div>
                )}
                {order.platform_username && (
                  <div>
                    <p className="text-xs text-muted mb-0.5">Platform Username</p>
                    <p className="dark:text-white text-dark-800 font-medium">{order.platform_username}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted mb-0.5">Category</p>
                  <p className="dark:text-white text-dark-800 font-medium capitalize">
                    {((order as any).product_category || order.product?.category || "").replace("_", " ")}
                  </p>
                </div>
              </div>

              {order.proof_of_payment_url && (
                <a href={order.proof_of_payment_url} target="_blank" rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-gold-500 hover:text-gold-400 transition-colors">
                  <ExternalLink size={14} /> View Proof of Payment
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
