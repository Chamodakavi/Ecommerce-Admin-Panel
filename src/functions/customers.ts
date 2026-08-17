import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export interface CustomerPayload {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export async function getCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createCustomer(payload: CustomerPayload) {
  const { data, error } = await supabase
    .from("customers")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomer(
  id: string,
  payload: Partial<CustomerPayload>
) {
  const { data, error } = await supabase
    .from("customers")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
  return true;
}