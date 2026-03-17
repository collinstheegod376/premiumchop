export type OrderStatus = "payment_made" | "processing" | "payment_received" | "delivered";
export type ProductCategory = "premium_services" | "mobile_numbers" | "digital_access";
export type UserRole = "user" | "admin";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  logo_url?: string;
  flag_url?: string;
  country?: string;
  description?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  user?: UserProfile;
  status: OrderStatus;
  full_name: string;
  contact_info?: string;
  platform_username?: string;
  platform_password?: string;
  proof_of_payment_url?: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  note?: string;
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
  payment_made: "text-yellow-500 bg-yellow-500/10",
  processing: "text-blue-500 bg-blue-500/10",
  payment_received: "text-emerald-500 bg-emerald-500/10",
  delivered: "text-gold-500 bg-gold-500/10",
};

export const STATUS_STEPS: OrderStatus[] = [
  "payment_made", "processing", "payment_received", "delivered"
];

export const PREMIUM_SERVICES: Omit<Product, "id" | "created_at">[] = [
  { name: "X Premium", category: "premium_services", price: 10000, logo_url: "https://abs.twimg.com/responsive-web/client-web/icon-ios.77d25eba.png", description: "Verified X (Twitter) Premium subscription" },
  { name: "Telegram Premium", category: "premium_services", price: 7000, logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/240px-Telegram_logo.svg.png", description: "Telegram Premium membership" },
  { name: "Apple Music", category: "premium_services", price: 2000, logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/240px-Apple_Music_icon.svg.png", description: "Apple Music individual subscription" },
  { name: "Facebook Premium", category: "premium_services", price: 10000, logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/240px-2023_Facebook_icon.svg.png", description: "Facebook Meta Verified badge" },
  { name: "Instagram Premium", category: "premium_services", price: 10000, logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/240px-Instagram_logo_2016.svg.png", description: "Instagram Meta Verified badge" },
];

export const MOBILE_NUMBERS: Omit<Product, "id" | "created_at">[] = [
  { name: "United States", category: "mobile_numbers", price: 3000, flag_url: "https://flagcdn.com/w80/us.png", country: "US" },
  { name: "United Kingdom", category: "mobile_numbers", price: 3000, flag_url: "https://flagcdn.com/w80/gb.png", country: "GB" },
  { name: "Canada", category: "mobile_numbers", price: 3000, flag_url: "https://flagcdn.com/w80/ca.png", country: "CA" },
  { name: "Australia", category: "mobile_numbers", price: 3000, flag_url: "https://flagcdn.com/w80/au.png", country: "AU" },
  { name: "Germany", category: "mobile_numbers", price: 3000, flag_url: "https://flagcdn.com/w80/de.png", country: "DE" },
  { name: "France", category: "mobile_numbers", price: 3000, flag_url: "https://flagcdn.com/w80/fr.png", country: "FR" },
  { name: "Netherlands", category: "mobile_numbers", price: 3000, flag_url: "https://flagcdn.com/w80/nl.png", country: "NL" },
];

export const DIGITAL_ACCESS: Omit<Product, "id" | "created_at">[] = [
  { name: "X Account", category: "digital_access", price: 10000, logo_url: "https://abs.twimg.com/responsive-web/client-web/icon-ios.77d25eba.png", description: "Aged X (Twitter) account" },
  { name: "Telegram Account", category: "digital_access", price: 10000, logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/240px-Telegram_logo.svg.png", description: "Telegram account access" },
  { name: "Facebook Account", category: "digital_access", price: 10000, logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/240px-2023_Facebook_icon.svg.png", description: "Facebook account access" },
  { name: "Instagram Account", category: "digital_access", price: 10000, logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/240px-Instagram_logo_2016.svg.png", description: "Instagram account access" },
  { name: "TikTok Account", category: "digital_access", price: 10000, logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Ionicons_logo-tiktok.svg/240px-Ionicons_logo-tiktok.svg.png", description: "TikTok account access" },
  { name: "LinkedIn Account", category: "digital_access", price: 10000, logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/LinkedIn_icon.svg/240px-LinkedIn_icon.svg.png", description: "LinkedIn account access" },
];
