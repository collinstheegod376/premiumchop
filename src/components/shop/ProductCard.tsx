"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShoppingCart, Globe, Phone, Key } from "lucide-react";
import type { Product } from "@/types";
import { formatNaira } from "@/lib/utils";
import { useState } from "react";

const CATEGORY_CONFIG = {
  premium_services: { badge: "Premium",       badgeClass: "bg-amber-500/15 text-amber-400 border border-amber-500/25" },
  mobile_numbers:   { badge: "Mobile Number", badgeClass: "bg-blue-500/15 text-blue-400 border border-blue-500/25"   },
  digital_access:   { badge: "Account",       badgeClass: "bg-purple-500/15 text-purple-400 border border-purple-500/25" },
};

const FALLBACK_ICONS: Record<string, React.ReactNode> = {
  premium_services: <Globe size={26} className="text-amber-400" />,
  mobile_numbers:   <Phone size={26} className="text-blue-400" />,
  digital_access:   <Key   size={26} className="text-purple-400" />,
};

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const config = CATEGORY_CONFIG[product.category];
  const imgSrc = product.flag_url || product.logo_url;

  function goCheckout(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/checkout?productId=${product.id}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -5 }}
      className="card p-5 flex flex-col gap-4 cursor-pointer select-none"
      onClick={goCheckout}
    >
      {/* Top row: logo + badge */}
      <div className="flex items-start justify-between gap-2">
        {/* Logo box */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden shrink-0"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
        >
          {imgSrc && !imgError ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="w-10 h-10 object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            FALLBACK_ICONS[product.category]
          )}
        </div>

        {/* Category badge */}
        <span className={`badge text-[10px] font-bold ${config.badgeClass}`}>
          {config.badge}
        </span>
      </div>

      {/* Name + description */}
      <div className="flex-1">
        <h3 className="font-display font-bold text-[0.95rem] leading-snug mb-1" style={{ color: "var(--text-primary)" }}>
          {product.name}
        </h3>
        {product.description ? (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>
            {product.description}
          </p>
        ) : product.country ? (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Virtual mobile number · {product.country}</p>
        ) : null}
      </div>

      {/* Price + CTA */}
      <div
        className="flex items-center justify-between pt-4 mt-auto"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>Price</p>
          <p className="font-display font-bold text-lg text-amber-400">{formatNaira(product.price)}</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary py-2 px-4 text-xs gap-1.5"
          onClick={goCheckout}
        >
          <ShoppingCart size={13} />
          Buy Now
        </motion.button>
      </div>
    </motion.div>
  );
}
