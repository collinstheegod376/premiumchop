"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, Copy, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@/types";
import { PREMIUM_SERVICES, MOBILE_NUMBERS, DIGITAL_ACCESS } from "@/types";
import { formatNaira } from "@/lib/utils";
import toast from "react-hot-toast";

const PAYMENT_ACCOUNT = "8136634819";
const PAYMENT_BANK = "OPAY";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const productId = searchParams.get("productId");
  const supabase = createClient();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    full_name: "", contact_info: "", platform_username: "", platform_password: "",
  });

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) { router.push("/shop"); return; }
      const { data } = await supabase.from("products").select("*").eq("id", productId).single();
      if (data) {
        setProduct(data as Product);
      } else {
        const all = [
          ...PREMIUM_SERVICES.map((p, i) => ({ ...p, id: `ps-${i}`, created_at: "" })),
          ...MOBILE_NUMBERS.map((p, i) => ({ ...p, id: `mn-${i}`, created_at: "" })),
          ...DIGITAL_ACCESS.map((p, i) => ({ ...p, id: `da-${i}`, created_at: "" })),
        ] as Product[];
        const found = all.find((p) => p.id === productId);
        setProduct(found || null);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [productId]);

  function copyAccount() {
    navigator.clipboard.writeText(PAYMENT_ACCOUNT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Account number copied!");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product || !user) return;
    if (!proofFile) { toast.error("Please upload proof of payment"); return; }
    setSubmitting(true);

    let proofUrl = "";
    const fileExt = proofFile.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("payment-proofs").upload(fileName, proofFile);

    if (uploadError) {
      toast.error("Failed to upload proof of payment");
      setSubmitting(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("payment-proofs").getPublicUrl(fileName);
    proofUrl = publicUrl;

    const orderPayload: any = {
      user_id: user.id,
      product_id: product.id.startsWith("ps-") || product.id.startsWith("mn-") || product.id.startsWith("da-") ? null : product.id,
      product_name: product.name,
      product_category: product.category,
      status: "payment_made",
      full_name: formData.full_name,
      total_amount: product.price,
      proof_of_payment_url: proofUrl,
    };
    if (product.category === "premium_services") {
      orderPayload.platform_username = formData.platform_username;
      orderPayload.platform_password = formData.platform_password;
    } else {
      orderPayload.contact_info = formData.contact_info;
    }

    const { data: order, error: orderError } = await supabase.from("orders").insert(orderPayload).select().single();
    if (orderError) {
      toast.error("Failed to place order. Please try again.");
      setSubmitting(false);
      return;
    }
    await supabase.from("order_status_history").insert({ order_id: order.id, status: "payment_made" });
    toast.success("Order placed successfully!");
    router.push(`/orders?success=${order.id}`);
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto animate-pulse space-y-4">
      <div className="h-8 dark:bg-dark-800 bg-gray-200 rounded w-1/2" />
      <div className="card p-6 h-40" />
    </div>
  );
  if (!product) return (
    <div className="text-center py-20">
      <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
      <p className="text-secondary">Product not found.</p>
      <button onClick={() => router.push("/shop")} className="btn-primary mt-4">Back to Shop</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-6">
        <ArrowLeft size={18} /> Back
      </button>
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-3xl font-bold dark:text-white text-dark-900 mb-6">
        Checkout
      </motion.h1>

      {/* Product summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-5 mb-6">
        <div className="flex items-center gap-4">
          {(product.logo_url || product.flag_url) && (
            <img src={product.logo_url || product.flag_url} alt={product.name}
              className="w-12 h-12 rounded-xl object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <div className="flex-1">
            <h2 className="font-display font-bold dark:text-white text-dark-900">{product.name}</h2>
            <p className="text-secondary text-sm capitalize">{product.category.replace("_", " ")}</p>
          </div>
          <p className="font-display font-bold text-xl text-gold-500">{formatNaira(product.price)}</p>
        </div>
      </motion.div>

      {/* Payment instructions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card p-5 mb-6 border border-gold-500/20" style={{ background: "rgba(245,158,11,0.05)" }}>
        <h3 className="font-semibold dark:text-white text-dark-900 mb-4 flex items-center gap-2">
          <CheckCircle size={18} className="text-gold-500" /> Payment Instructions
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-secondary text-sm">Bank / Wallet</span>
            <span className="font-bold dark:text-white text-dark-900">{PAYMENT_BANK}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary text-sm">Account Number</span>
            <div className="flex items-center gap-2">
              <span className="font-bold font-mono dark:text-white text-dark-900">{PAYMENT_ACCOUNT}</span>
              <button onClick={copyAccount} className="p-1.5 rounded-lg transition-colors hover:bg-gold-500/10">
                {copied ? <CheckCircle size={14} className="text-gold-500" /> : <Copy size={14} className="text-muted" />}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary text-sm">Amount</span>
            <span className="font-bold text-gold-500">{formatNaira(product.price)}</span>
          </div>
        </div>
        <p className="text-xs text-muted mt-4 p-3 rounded-lg dark:bg-dark-800 bg-gray-100">
          Transfer the exact amount above, then fill the form and upload your proof of payment below.
        </p>
      </motion.div>

      {/* Form */}
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        onSubmit={handleSubmit} className="card p-5 space-y-4">
        <h3 className="font-display font-bold dark:text-white text-dark-900">Order Details</h3>

        <div>
          <label className="label">Full Name *</label>
          <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="input-field" placeholder="Your full name" required />
        </div>

        {product.category === "premium_services" ? (
          <>
            <div>
              <label className="label">Platform Username *</label>
              <input type="text" value={formData.platform_username}
                onChange={(e) => setFormData({ ...formData, platform_username: e.target.value })}
                className="input-field" placeholder="@username" required />
            </div>
            <div>
              <label className="label">Platform Password *</label>
              <input type="password" value={formData.platform_password}
                onChange={(e) => setFormData({ ...formData, platform_password: e.target.value })}
                className="input-field" placeholder="Account password" required />
            </div>
          </>
        ) : (
          <div>
            <label className="label">Contact Info (Phone / Email) *</label>
            <input type="text" value={formData.contact_info}
              onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
              className="input-field" placeholder="08012345678 or email@example.com" required />
          </div>
        )}

        {/* File upload */}
        <div>
          <label className="label">Proof of Payment *</label>
          <label className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-gold-500/50"
            style={{ borderColor: proofFile ? "rgba(245,158,11,0.5)" : "var(--border-color)", background: proofFile ? "rgba(245,158,11,0.05)" : "var(--bg-secondary)" }}>
            <input type="file" accept="image/*,.pdf" className="hidden"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
            {proofFile ? (
              <>
                <CheckCircle size={28} className="text-gold-500" />
                <span className="text-sm font-medium dark:text-white text-dark-900">{proofFile.name}</span>
                <span className="text-xs text-muted">Click to change</span>
              </>
            ) : (
              <>
                <Upload size={28} className="text-muted" />
                <span className="text-sm text-secondary">Click to upload screenshot or PDF</span>
                <span className="text-xs text-muted">JPG, PNG, PDF up to 5MB</span>
              </>
            )}
          </label>
        </div>

        <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          className="btn-primary w-full">
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
              Placing Order...
            </span>
          ) : `Place Order — ${formatNaira(product.price)}`}
        </motion.button>
      </motion.form>
    </div>
  );
}
