"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Product, ProductCategory } from "@/types";
import { PREMIUM_SERVICES, MOBILE_NUMBERS, DIGITAL_ACCESS } from "@/types";

const TABS: { id: ProductCategory | "all"; label: string }[] = [
  { id: "premium_services", label: "Premium Services" },
  { id: "mobile_numbers", label: "Mobile Numbers" },
  { id: "digital_access", label: "Digital Access" },
];

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState<ProductCategory>("premium_services");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (!error && data && data.length > 0) {
        setProducts(data as Product[]);
      } else {
        // Use static data as fallback / seed
        const staticProducts = [
          ...PREMIUM_SERVICES.map((p, i) => ({ ...p, id: `ps-${i}`, created_at: new Date().toISOString() })),
          ...MOBILE_NUMBERS.map((p, i) => ({ ...p, id: `mn-${i}`, created_at: new Date().toISOString() })),
          ...DIGITAL_ACCESS.map((p, i) => ({ ...p, id: `da-${i}`, created_at: new Date().toISOString() })),
        ] as Product[];
        setProducts(staticProducts);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const filtered = products.filter(
    (p) => p.category === activeTab && p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl lg:text-4xl font-bold dark:text-white text-dark-900 mb-2">
          Digital Marketplace
        </h1>
        <p className="text-secondary">Browse and purchase premium digital services instantly</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-field pl-11 max-w-md"
        />
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ProductCategory)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`shrink-0 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-gold-500 text-dark-950 shadow-lg shadow-gold-500/20"
                : "dark:bg-dark-800 bg-white border dark:border-dark-700 border-gray-200 dark:text-dark-300 text-dark-600 hover:border-gold-500/40"
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 h-52 animate-pulse">
              <div className="w-14 h-14 rounded-2xl dark:bg-dark-700 bg-gray-200 mb-4" />
              <div className="h-4 dark:bg-dark-700 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 dark:bg-dark-700 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <SlidersHorizontal size={48} className="mx-auto mb-4 opacity-30" />
          <p>No products found</p>
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
