import { createClient } from "@/utils/supabase/client";

export async function getBrands(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("brands")
    .select("brand_name")
    .order("brand_name", { ascending: true });

  if (error) throw error;
  return data?.map((b) => b.brand_name) || [];
}

export async function createBrand(brand_name: string): Promise<string> {
  const supabase = createClient();
  const cleanName = brand_name.trim();

  const { data, error } = await supabase
    .from("brands")
    .insert([{ brand_name: cleanName }])
    .select("brand_name")
    .single();

  if (error) throw error;
  return data.brand_name;
}