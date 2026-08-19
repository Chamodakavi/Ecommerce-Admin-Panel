import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export interface ProductCreateData {
  custom_product_id: string;
  name: string;
  category?: string;
  brand?: string;

  cost_price?: number | null;
  selling_price?: number | null;

  stock_quantity?: number;
  availability_status?: string;

  description?: string;

  image_urls?: string[];
  image_url?: string | null;
}

export interface ProductUpdateData {
  custom_product_id?: string;
  name?: string;
  category?: string;
  brand?: string;

  cost_price?: number | null;
  selling_price?: number | null;

  stock_quantity?: number;
  availability_status?: string;

  description?: string;

  image_urls?: string[];
  image_url?: string | null;
}

/**
 * Get all products
 */
export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("getProducts error:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get one product
 */
export async function getProduct(productId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error) {
    console.error("getProduct error:", error);
    throw error;
  }

  return data;
}

/**
 * Create product
 */
export async function createProduct(
  product: ProductCreateData
) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      custom_product_id: product.custom_product_id,
      name: product.name,

      category: product.category || null,
      brand: product.brand || null,

      cost_price:
        product.cost_price !== undefined
          ? product.cost_price
          : null,

      selling_price:
        product.selling_price !== undefined
          ? product.selling_price
          : null,

      stock_quantity:
        product.stock_quantity ?? 0,

      availability_status:
        product.availability_status || "In Stock",

      description:
        product.description || null,

      image_urls:
        product.image_urls || [],

      image_url:
        product.image_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("createProduct error:", error);
    throw error;
  }

  return data;
}

/**
 * Update product
 */
export async function updateProduct(
  productId: string,
  updates: ProductUpdateData
) {
  const { data, error } = await supabase
    .from("products")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select()
    .single();

  if (error) {
    console.error("updateProduct error:", error);
    throw error;
  }

  return data;
}

/**
 * Delete product
 */
export async function deleteProduct(
  productId: string
) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error("deleteProduct error:", error);
    throw error;
  }

  return true;
}