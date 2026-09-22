import { createClient } from "@/utils/supabase/client";

export async function getCategories(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("cat_name")
    .order("cat_name", { ascending: true });

  if (error) throw error;
  return data?.map((item) => item.cat_name) || [];
}

export async function createCategory(cat_name: string): Promise<string> {
  const supabase = createClient();
  const cleanName = cat_name.trim();

  const { data, error } = await supabase
    .from("categories")
    .insert([{ cat_name: cleanName }])
    .select("cat_name")
    .single();

  if (error) throw error;
  return data.cat_name;
}