import { createAdminClient } from "@/lib/supabase/server";
import { PREMIUM_SERVICES, MOBILE_NUMBERS, DIGITAL_ACCESS } from "@/types";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = createAdminClient();
  const allProducts = [
    ...PREMIUM_SERVICES.map(p => ({ ...p })),
    ...MOBILE_NUMBERS.map(p => ({ ...p })),
    ...DIGITAL_ACCESS.map(p => ({ ...p })),
  ];
  const { data, error } = await supabase.from("products").upsert(allProducts, { onConflict: "name" }).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inserted: data?.length });
}
