"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Copy, CheckCircle2, Upload, AlertCircle,
  Shield, Zap, Lock, Phone, Globe, Key
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@/types";
import { PREMIUM_SERVICES, MOBILE_NUMBERS, DIGITAL_ACCESS } from "@/types";
import { formatNaira } from "@/lib/utils";
import toast from "react-hot-toast";

const PAYMENT_ACCOUNT = "8136634819";
const PAYMENT_BANK    = "OPAY";
const PAYMENT_NAME    = "PremiumStore";

function allStaticProducts(): Product[] {
  return [
    ...PREMIUM_SERVICES.map((p, i) => ({ ...p, id: `ps-${i}`, created_at: "" })),
    ...MOBILE_NUMBERS.map((p,  i) => ({ ...p, id: `mn-${i}`, created_at: "" })),
    ...DIGITAL_ACCESS.map((p,  i) => ({ ...p, id: `da-${i}`, created_at: "" })),
  ] as Product[];
}

function LogoBox({ product }: { product: Product }) {
  const [err, setErr] = useState(false);
  const imgSrc = product.flag_url || product.logo_url;
  const icons: Record<string, React.ReactNode> = {
    premium_services: <Globe size={28} className="text-amber-400" />,
    mobile_numbers:   <Phone size={28} className="text-blue-400"  />,
    digital_access:   <Key   size={28} className="text-purple-400" />,
  };
  return (
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden shrink-0"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
      {imgSrc && !err
        ? <img src={imgSrc} alt={product.name} className="w-11 h-11 object-contain" onError={() => setErr(true)} />
        : icons[product.category]}
    </div>
  );
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { user }     = useAuth();
  const productId    = searchParams.get("productId");
  const supabase     = createClient();

  const [product,    setProduct]    = useState<Product | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [proofFile,  setProofFile]  = useState<File | null>(null);
  const [step,       setStep]       = useState<1 | 2>(1); // 1=payment info, 2=form

  const [form, setForm] = useState({
    full_name: "", contact_info: "", platform_username: "", platform_password: "",
  });

  useEffect(() => {
    async function load() {
      if (!productId) { router.push("/shop"); return; }
      const { data } = await supabase.from("products").select("*").eq("id", productId).single();
      if (data) { setProduct(data as Product); }
      else {
        const found = allStaticProducts().find(p => p.id === productId);
        setProduct(found || null);
      }
      setLoading(false);
    }
    load();
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

    // Upload proof
    let proofUrl = "";
    const ext      = proofFile.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("payment-proofs").upload(fileName, proofFile, { upsert: true });

    if (upErr) {
      toast.error("Upload failed. Check storage bucket permissions.");
      setSubmitting(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("payment-proofs").getPublicUrl(fileName);
    proofUrl = publicUrl;

    // Build order
    const payload: any = {
      user_id:          user.id,
      product_id:       product.id.startsWith("ps-") || product.id.startsWith("mn-") || product.id.startsWith("da-") ? null : product.id,
      product_name:     product.name,
      product_category: product.category,
      status:           "payment_made",
      full_name:        form.full_name,
      total_amount:     product.price,
      proof_of_payment_url: proofUrl,
    };
    if (product.category === "premium_services") {
      payload.platform_username = form.platform_username;
      payload.platform_password = form.platform_password;
    } else {
      payload.contact_info = form.contact_info;
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders").insert(payload).select().single();

    if (orderErr) {
      toast.error("Failed to place order. Please try again.");
      setSubmitting(false);
      return;
    }
    await supabase.from("order_status_history").insert({
      order_id: order.id, status: "payment_made",
    });
    toast.success("Order sent to admin! We'll process it shortly.");
    router.push(`/orders?success=${order.id}`);
  }

  if (loading) return (
    <div className="max-w-xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 rounded-xl w-48" style={{ background: "var(--bg-card)" }} />
      <div className="h-40 rounded-2xl" style={{ background: "var(--bg-card)" }} />
      <div className="h-64 rounded-2xl" style={{ background: "var(--bg-card)" }} />
    </div>
  );

  if (!product) return (
    <div className="text-center py-24">
      <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
      <p className="font-display text-xl mb-4" style={{ color: "var(--text-primary)" }}>Product not found</p>
      <button onClick={() => router.push("/shop")} className="btn-primary">Back to Shop</button>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto pb-10">
      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm mb-6 hover:text-amber-400 transition-colors"
        style={{ color: "var(--text-secondary)" }}>
        <ArrowLeft size={16} /> Back to Shop
      </button>

      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
        Checkout
      </motion.h1>

      {/* ── Product Summary Card ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-flat p-5 mb-4">
        <p className="label mb-3">You are purchasing</p>
        <div className="flex items-center gap-4">
          <LogoBox product={product} />
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-lg leading-tight" style={{ color: "var(--text-primary)" }}>
              {product.name}
            </h2>
            <p className="text-sm mt-0.5 capitalize" style={{ color: "var(--text-secondary)" }}>
              {product.category.replace("_", " ")}
            </p>
            {product.description && (
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{product.description}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Total</p>
            <p className="font-display font-bold text-2xl text-amber-400">{formatNaira(product.price)}</p>
          </div>
        </div>
      </motion.div>

      {/* ── Payment Instructions ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="mb-4 rounded-2xl p-5"
        style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Zap size={14} className="text-amber-400" />
          </div>
          <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Step 1 — Make Payment
          </p>
        </div>

        <div className="space-y-3">
          {[
            { label: "Bank / Wallet", value: PAYMENT_BANK },
            { label: "Account Name",  value: PAYMENT_NAME },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{row.label}</span>
              <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{row.value}</span>
            </div>
          ))}

          {/* Account number with copy */}
          <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Account Number</span>
            <div className="flex items-center gap-2">
              <span className="font-bold font-mono text-base" style={{ color: "var(--text-primary)" }}>
                {PAYMENT_ACCOUNT}
              </span>
              <button onClick={copyAccount}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-amber-500/15"
                style={{ border: "1px solid rgba(245,158,11,0.3)" }}>
                {copied
                  ? <CheckCircle2 size={13} className="text-amber-400" />
                  : <Copy size={13} className="text-amber-400" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: "rgba(245,158,11,0.2)" }}>
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Amount to Send</span>
            <span className="font-display font-bold text-lg text-amber-400">{formatNaira(product.price)}</span>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
          ⚡ Transfer the exact amount above, then complete Step 2 below with your proof of payment.
        </div>
      </motion.div>

      {/* ── Order Form ── */}
      <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        onSubmit={handleSubmit} className="card-flat p-5 space-y-4">

        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Shield size={14} className="text-amber-400" />
          </div>
          <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Step 2 — Complete Your Order
          </p>
        </div>

        {/* Full name (always) */}
        <div>
          <label className="label">Full Name *</label>
          <input type="text" value={form.full_name}
            onChange={e => setForm({ ...form, full_name: e.target.value })}
            className="input-field" placeholder="Your full name" required />
        </div>

        {/* Premium services: need username + password */}
        {product.category === "premium_services" && (
          <>
            <div>
              <label className="label">Platform Username *</label>
              <input type="text" value={form.platform_username}
                onChange={e => setForm({ ...form, platform_username: e.target.value })}
                className="input-field" placeholder="@yourusername" required />
            </div>
            <div>
              <label className="label">Platform Password *</label>
              <div className="relative">
                <input type="password" value={form.platform_password}
                  onChange={e => setForm({ ...form, platform_password: e.target.value })}
                  className="input-field pr-11" placeholder="Account password" required />
                <Lock size={15} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              </div>
              <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                🔒 Your credentials are encrypted and only visible to our admin team.
              </p>
            </div>
          </>
        )}

        {/* Others: contact info */}
        {product.category !== "premium_services" && (
          <div>
            <label className="label">Contact Info (Phone / Email) *</label>
            <input type="text" value={form.contact_info}
              onChange={e => setForm({ ...form, contact_info: e.target.value })}
              className="input-field" placeholder="08012345678 or email@example.com" required />
          </div>
        )}

        {/* File upload */}
        <div>
          <label className="label">Proof of Payment *</label>
          <label className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200"
            style={{
              borderColor: proofFile ? "rgba(245,158,11,0.6)" : "var(--border-color)",
              background:  proofFile ? "rgba(245,158,11,0.05)" : "var(--bg-secondary)",
            }}>
            <input type="file" accept="image/*,.pdf" className="hidden"
              onChange={e => setProofFile(e.target.files?.[0] || null)} />
            {proofFile ? (
              <>
                <CheckCircle2 size={30} className="text-amber-400" />
                <div className="text-center">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{proofFile.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Click to change file</p>
                </div>
              </>
            ) : (
              <>
                <Upload size={30} style={{ color: "var(--text-muted)" }} />
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    Upload payment screenshot or receipt
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>JPG, PNG or PDF — max 5MB</p>
                </div>
              </>
            )}
          </label>
        </div>

        {/* Submit */}
        <motion.button type="submit" disabled={submitting}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          className="btn-primary w-full py-3.5 text-base mt-2">
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
              Sending Order...
            </span>
          ) : (
            <>
              <CheckCircle2 size={17} />
              Send Order — {formatNaira(product.price)}
            </>
          )}
        </motion.button>

        <p className="text-center text-xs pt-1" style={{ color: "var(--text-muted)" }}>
          🔐 Your order is securely stored. Admin will confirm within minutes.
        </p>
      </motion.form>
    </div>
  );
}
