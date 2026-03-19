"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderStatus } from "@/types";

export function useOrders(userId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("*, product:products(*), user:users(*)")
      .order("created_at", { ascending: false });

    if (userId) query = query.eq("user_id", userId);

    const { data, error } = await query;
    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (!error) {
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        status,
      });
      fetchOrders();
    }
    return !error;
  }

  return {
    orders,
    loading,
    refetch: fetchOrders,
    updateOrderStatus,          // used by admin page
    updateStatus: updateOrderStatus, // alias for compatibility
  };
}