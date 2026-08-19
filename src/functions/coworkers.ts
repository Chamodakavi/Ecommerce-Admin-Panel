import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export interface CoworkerPayload {
  avatar_url?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  phone?: string | null;
  job_title?: string | null;
  status?: "Active" | "Inactive" | string;
  bio?: string | null;
  country?: string | null;
  city_state?: string | null;
  postal_code?: string | null;
  tax_id?: string | null;
}

export interface Coworker extends CoworkerPayload {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// 1. Fetch all co-workers
export async function getCoworkers(): Promise<Coworker[]> {
  const { data, error } = await supabase
    .from("coworkers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Coworker[];
}

// 2. Fetch a single co-worker by ID
export async function getCoworkerById(id: string): Promise<Coworker | null> {
  const { data, error } = await supabase
    .from("coworkers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Coworker | null;
}

// 3. Create a new co-worker
export async function createCoworker(payload: CoworkerPayload): Promise<Coworker> {
  const { data, error } = await supabase
    .from("coworkers")
    .insert([
      {
        ...payload,
        status: payload.status || "Active",
        country: payload.country || "Sri Lanka",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Coworker;
}

// 4. Update an existing co-worker
export async function updateCoworker(
  id: string,
  payload: Partial<CoworkerPayload>
): Promise<Coworker> {
  const { data, error } = await supabase
    .from("coworkers")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Coworker;
}

// 5. Delete a co-worker
export async function deleteCoworker(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("coworkers")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}