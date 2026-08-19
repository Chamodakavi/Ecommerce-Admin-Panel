import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export interface OwnerProfile {
  id: string;
  avatar_url?: string | null;
  display_name: string;
  role: string;
  location: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  country?: string | null;
  city_state?: string | null;
  postal_code?: string | null;
  tax_id?: string | null;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

// 1. Fetch the owner profile
export async function getOwnerProfile(): Promise<OwnerProfile | null> {
  const { data, error } = await supabase
    .from("owner_profile")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as OwnerProfile | null;
}

// 2. Update owner profile details
export async function updateOwnerProfile(id: string, payload: Partial<OwnerProfile>) {
  const { data, error } = await supabase
    .from("owner_profile")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as OwnerProfile;
}

// Authenticate owner credentials against owner_profile
export async function authenticateOwner(email: string, password: string): Promise<OwnerProfile> {
  const { data, error } = await supabase
    .from("owner_profile")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .eq("password", password.trim())
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Invalid email or password. Please try again.");
  }

  return data as OwnerProfile;
}