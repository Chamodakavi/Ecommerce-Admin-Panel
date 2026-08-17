import { createClient } from "@/utils/supabase/client";

// Define the Coworker interface matching your database schema
export interface CoworkerInput {
  avatar_url?: string | null;
  first_name: string;
  last_name: string;
  job_title: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  country?: string | null;
  city_state?: string | null;
  postal_code?: string | null;
  tax_id?: string | null;
  status?: string; // e.g. "Active", "On Leave", "Inactive"
}

export interface Coworker extends CoworkerInput {
  id: string;
  created_at: string;
  updated_at: string;
}

const supabase = createClient();

/**
 * Fetch all co-workers from Supabase
 */
export async function getCoworkers(): Promise<Coworker[]> {
  const { data, error } = await supabase
    .from("coworkers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching co-workers:", error.message);
    throw error;
  }

  return data as Coworker[];
}

/**
 * Fetch a single co-worker by UUID
 */
export async function getCoworkerById(id: string): Promise<Coworker> {
  const { data, error } = await supabase
    .from("coworkers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching co-worker ${id}:`, error.message);
    throw error;
  }

  return data as Coworker;
}

/**
 * Add a new co-worker to Supabase
 */
export async function createCoworker(coworkerData: CoworkerInput): Promise<Coworker[]> {
  const { data, error } = await supabase
    .from("coworkers")
    .insert([coworkerData])
    .select();

  if (error) {
    console.error("Error creating co-worker:", error.message);
    throw error;
  }

  return data as Coworker[];
}

/**
 * Update an existing co-worker's details
 */
export async function updateCoworker(
  id: string,
  updatedData: Partial<CoworkerInput>
): Promise<Coworker[]> {
  const { data, error } = await supabase
    .from("coworkers")
    .update({ ...updatedData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) {
    console.error(`Error updating co-worker ${id}:`, error.message);
    throw error;
  }

  return data as Coworker[];
}

/**
 * Delete a co-worker by UUID
 */
export async function deleteCoworker(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("coworkers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting co-worker ${id}:`, error.message);
    throw error;
  }

  return true;
}