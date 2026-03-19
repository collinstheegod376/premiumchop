"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Product, ProductCategory } from "@/types";
import { PREMIUM_SERVICES, MOBILE_NUMBERS, DIGITAL_ACCESS } from "@/types";

const TABS: { id: ProductCategory; label: string; emoji: string }[] = [
  { id: "premium_services", label: "Premium Services", emoji: "⭐" },
  { id: "mobile_numbers",   label: "Mobile Numbers",   emoji: "📱" },
  { id: "digital_access",   label: "Digital Access",   emoji: "🔑" },
];

function SkeletonCard() {
  return (
    <div className="card-flat p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-2xl" style={{ background: "var(--bg-secondary)" }} />
        <div className="w-16 h-5 rounded-full" style={{ background: "var(--bg-secondary)" }} />
      </div>
      <div className="h-4 rounded-lg w-3/4 mb-2" style={{ background: "var(--bg-secondary)" }} />
      <div className="h-3 rounded-lg w-1/2"     style={{ background: "var(--bg-secondary)" }} />
      <div className="flex justify-between items-center mt-5 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="h-6 w-20 rounded-lg" style={{ background: "var(--bg-secondary)" }} />
        <div className="h-8 w-24 rounded-xl" style={{ background: "var(--bg-secondary)" }} />
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState<ProductCategory>("premium_services");
  const [products,  setProducts]  = useState<Product[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (!error && data && data.length > 0) {
        setProducts(data as Product[]);
      } else {
        const now = new Date().toISOString();
        setProducts([
          ...PREMIUM_SERVICES.map((p, i) => ({ ...p, id: `ps-${i}`, created_at: now })),
          ...MOBILE_NUMBERS  .map((p, i) => ({ ...p, id: `mn-${i}`, created_at: now })),
          ...DIGITAL_ACCESS  .map((p, i) => ({ ...p, id: `da-${i}`, created_at: now })),
        ] as Product[]);
      }
      setLoading(false);
    }
    fetch();
  }, []);

  const filtered = products.filter(p =>
    p.category === activeTab &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero banner */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-2xl p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 100%)", border: "1px solid rgba(245,158,11,0.2)" }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Digital Marketplace</span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Premium Digital Services
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Browse subscriptions, mobile numbers and account access — delivered instantly.
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products…" className="input-field pl-10" />
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeTab === tab.id
                ? "btn-primary"
                : "btn-secondary"
            }`}>
            <span>{tab.emoji}</span>
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <SlidersHorizontal size={44} className="mx-auto mb-4 opacity-20" style={{ color: "var(--text-muted)" }} />
          <p className="font-display text-lg" style={{ color: "var(--text-secondary)" }}>No products found</p>
          {search && (
            <button onClick={() => setSearch("")} className="btn-secondary mt-4">Clear search</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
