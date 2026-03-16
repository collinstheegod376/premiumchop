"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Globe } from "lucide-react";
import type { Product } from "@/types";
import { formatNaira } from "@/lib/utils";

interface ProductCardProps { product: Product; index?: number; }

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }} whileHover={{ y: -4 }}
      className="card p-5 flex flex-col gap-4 group cursor-pointer"
      onClick={() => router.push(`/checkout?productId=${product.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center shrink-0"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
          {(product.flag_url || product.logo_url) ? (
            <img src={product.flag_url || product.logo_url || ""} alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <Globe size={24} className="text-muted" />
          )}
        </div>
        {product.category === "mobile_numbers" && <span className="badge bg-blue-500/10 text-blue-400 text-xs">Mobile Number</span>}
        {product.category === "digital_access" && <span className="badge bg-purple-500/10 text-purple-400 text-xs">Account Access</span>}
        {product.category === "premium_services" && <span className="badge bg-gold-500/10 text-gold-500 text-xs">Premium</span>}
      </div>
      <div className="flex-1">
        <h3 className="font-display font-semibold text-base dark:text-white text-dark-900 mb-1">{product.name}</h3>
        {product.description && <p className="text-xs text-muted line-clamp-2">{product.description}</p>}
        {product.country && <p className="text-xs text-muted mt-1">Virtual mobile number</p>}
      </div>
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border-color)" }}>
        <div>
          <p className="text-xs text-muted mb-0.5">Price</p>
          <p className="font-display font-bold text-lg text-gold-500">{formatNaira(product.price)}</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
          onClick={(e) => { e.stopPropagation(); router.push(`/checkout?productId=${product.id}`); }}>
          <ShoppingCart size={15} />Buy Now
        </motion.button>
      </div>
    </motion.div>
  );
}
