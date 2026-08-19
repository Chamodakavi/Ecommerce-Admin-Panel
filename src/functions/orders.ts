import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export type OrderStatus = "processing" | "packed" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  product_id?: string;
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

export interface CreateOrderPayload {
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee?: number;
  discount?: number;
  total_amount: number;
  payment_method?: string;
  payment_status?: string;
  notes?: string;
}

export interface OrderRecord extends CreateOrderPayload {
  id: string;
  order_number: string;
  order_status: OrderStatus;
  created_at: string;
  updated_at?: string;
}

// Generate unique order number (e.g. ORD-839201)
export const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(10 + Math.random() * 90); // 2-digit randomizer
  return `ORD-${timestamp}${random}`;
};

// 1. Customer places a new order (initial status defaults to 'processing')
export async function createOrder(payload: CreateOrderPayload) {
  const orderNumber = generateOrderNumber();
  const { data, error } = await supabase
    .from("orders")
    .insert([
      {
        ...payload,
        order_number: orderNumber,
        order_status: "processing",
        payment_status: payload.payment_status || "Pending",
        delivery_fee: payload.delivery_fee ?? 0,
        discount: payload.discount ?? 0,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as OrderRecord;
}

// 2. Customer gets their specific order by ID or order_number
export async function getCustomerOrder(identifier: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .or(`id.eq.${identifier},order_number.eq.${identifier}`)
    .single();

  if (error) throw error;
  return data as OrderRecord;
}

// 3. Customer gets their order history by email or customer_id
export async function getCustomerOrdersList(customerEmailOrId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .or(`customer_email.eq.${customerEmailOrId},customer_id.eq.${customerEmailOrId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as OrderRecord[];
}

// 4. Admin / Coworker: Fetch all orders
export async function getAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as OrderRecord[];
}

// 5. Admin / Coworker: Fetch only shipped/delivered orders
export async function getShippedOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .in("order_status", ["shipped", "delivered"])
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as OrderRecord[];
}

// 6. Admin / Coworker: Update order status (e.g. processing -> packed -> shipped)
export async function updateOrderStatus(orderId: string, nextStatus: OrderStatus) {
  const { data, error } = await supabase
    .from("orders")
    .update({
      order_status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data as OrderRecord;
}

// 7. Delete an order (Admin only)
export async function deleteOrder(orderId: string) {
  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", orderId);

  if (error) throw error;
  return true;
}