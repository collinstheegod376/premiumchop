export type OrderStatus =
  | "payment_made"
  | "processing"
  | "payment_received"
  | "delivered";

export type ProductCategory =
  | "premium_services"
  | "mobile_numbers"
  | "digital_access";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  logo_url?: string;
  country?: string;
  flag_url?: string;
  description?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: "user" | "admin";
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  product_id?: string;
  product?: Product;
  status: OrderStatus;
  full_name: string;
  contact_info?: string;
  platform_username?: string;
  platform_password?: string;
  proof_of_payment_url?: string;
  total_amount: number;
  product_name?: string;
  product_category?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  note?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  proof_url?: string;
  verified: boolean;
  created_at: string;
}

export interface CheckoutFormData {
  full_name: string;
  contact_info?: string;
  platform_username?: string;
  platform_password?: string;
  proof_of_payment?: File;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  payment_made: "Payment Made",
  processing: "Processing",
  payment_received: "Payment Received",
  delivered: "Delivered",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  payment_made:     "text-yellow-500 bg-yellow-500/10",
  processing:       "text-blue-400 bg-blue-500/10",
  payment_received: "text-emerald-400 bg-emerald-500/10",
  delivered:        "text-amber-400 bg-amber-500/10",
};

/* ── PRODUCT DATA ── */
export const PREMIUM_SERVICES: Omit<Product, "id" | "created_at">[] = [
  {
    name: "X Premium",
    category: "premium_services",
    price: 10000,
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/X_logo_2023_original.svg/300px-X_logo_2023_original.svg.png",
    description: "Verified X (Twitter) Premium subscription",
  },
  {
    name: "Telegram Premium",
    category: "premium_services",
    price: 7000,
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Telegram_2019_Logo.svg/240px-Telegram_2019_Logo.svg.png",
    description: "Telegram Premium membership",
  },
  {
    name: "Apple Music",
    category: "premium_services",
    price: 2000,
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/240px-Apple_Music_icon.svg.png",
    description: "Apple Music subscription",
  },
  {
    name: "Facebook Premium",
    category: "premium_services",
    price: 10000,
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/240px-2023_Facebook_icon.svg.png",
    description: "Facebook Premium subscription",
  },
  {
    name: "Instagram Premium",
    category: "premium_services",
    price: 10000,
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/240px-Instagram_logo_2016.svg.png",
    description: "Instagram Premium subscription",
  },
];

export const MOBILE_NUMBERS: Omit<Product, "id" | "created_at">[] = [
  { name: "United States", category: "mobile_numbers", price: 3000, flag_url: "https://flagcdn.com/w80/us.png", country: "US" },
  { name: "United Kingdom", category: "mobile_numbers", price: 3000, flag_url: "https://flagcdn.com/w80/gb.png", country: "GB" },
  { name: "Canada",         category: "mobile_numbers", price: 3000, flag_url: "https://flagcdn.com/w80/ca.png", country: "CA" },
  { name: "Australia",      category: "mobile_numbers", price: 3000, flag_url: "https://flagcdn.com/w80/au.png", country: "AU" },
  { name: "Germany",        category: "mobile_numbers", price: 3000, flag_url: "https://flagcdn.com/w80/de.png", country: "DE" },
  { name: "France",         category: "mobile_numbers", price: 3000, flag_url: "https://flagcdn.com/w80/fr.png", country: "FR" },
  { name: "Netherlands",    category: "mobile_numbers", price: 3000, flag_url: "https://flagcdn.com/w80/nl.png", country: "NL" },
];

export const DIGITAL_ACCESS: Omit<Product, "id" | "created_at">[] = [
  { name: "X Account",         category: "digital_access", price: 10000, logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/X_logo_2023_original.svg/300px-X_logo_2023_original.svg.png", description: "Verified X account access" },
  { name: "Telegram Account",  category: "digital_access", price: 10000, logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Telegram_2019_Logo.svg/240px-Telegram_2019_Logo.svg.png", description: "Telegram account access" },
  { name: "Facebook Account",  category: "digital_access", price: 10000, logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/240px-2023_Facebook_icon.svg.png", description: "Facebook account access" },
  { name: "Instagram Account", category: "digital_access", price: 10000, logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/240px-Instagram_logo_2016.svg.png", description: "Instagram account access" },
  { name: "TikTok Account",    category: "digital_access", price: 10000, logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/TikTok_logo.svg/320px-TikTok_logo.svg.png", description: "TikTok account access" },
  { name: "LinkedIn Account",  category: "digital_access", price: 10000, logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/LinkedIn_icon.svg/240px-LinkedIn_icon.svg.png", description: "LinkedIn account access" },
];
