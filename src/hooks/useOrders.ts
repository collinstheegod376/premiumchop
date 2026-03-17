"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";

export function useOrders(userId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    let q = supabase
      .from("orders")
      .select("*, product:products(*), user:users(*)")
      .order("created_at", { ascending: false });
    if (userId) q = q.eq("user_id", userId);
    const { data } = await q;
    if (data) setOrders(data as Order[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchOrders();
    const supabase = createClient();
    const ch = supabase
      .channel("orders-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchOrders]);

  async function updateStatus(orderId: string, status: Order["status"]) {
    const supabase = createClient();
    await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", orderId);
    await supabase.from("order_status_history").insert({ order_id: orderId, status });
    fetchOrders();
  }

  return { orders, loading, refetch: fetchOrders, updateStatus };
}
