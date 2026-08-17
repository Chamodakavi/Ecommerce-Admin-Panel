import { createClient } from "@/utils/supabase/client";

// Define the Product interface matching your database table
export interface ProductInput {
  custom_product_id: string;
  name: string;
  category?: string;
  brand?: string;
  price: number;
  stock_quantity: number;
  availability_status?: string;
  description?: string;
  image_url?: string;
}

const supabase = createClient();

/**
 * Fetch all products from Supabase
 */
export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error.message);
    throw error;
  }

  return data;
}

/**
 * Fetch a single product by custom product ID
 */
export async function getProductByCustomId(customId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("custom_product_id", customId)
    .single();

  if (error) {
    console.error(`Error fetching product ${customId}:`, error.message);
    throw error;
  }

  return data;
}

/**
 * Add a new product to Supabase
 */
export async function createProduct(productData: ProductInput) {
  const { data, error } = await supabase
    .from("products")
    .insert([productData])
    .select();

  if (error) {
    console.error("Error creating product:", error.message);
    throw error;
  }

  return data;
}

/**
 * Delete a product by primary ID
 */
export async function deleteProduct(id: number) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting product:", error.message);
    throw error;
  }

  return true;
}