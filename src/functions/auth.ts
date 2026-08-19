import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export interface AuthSessionUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  role: string;
  account_type: "owner" | "coworker";
  avatar_url?: string | null;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthSessionUser> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  // 1. Check Owner Table
  const { data: owner } = await supabase
    .from("owner_profile")
    .select("*")
    .eq("email", cleanEmail)
    .eq("password", cleanPassword)
    .maybeSingle();

  if (owner) {
    return {
      id: owner.id,
      email: owner.email,
      first_name: owner.first_name,
      last_name: owner.last_name,
      display_name: owner.display_name || `${owner.first_name} ${owner.last_name}`,
      role: owner.role || "Owner",
      account_type: "owner",
      avatar_url: owner.avatar_url,
    };
  }

  // 2. Check Coworkers Table
  const { data: coworker } = await supabase
    .from("coworkers")
    .select("*")
    .eq("email", cleanEmail)
    .eq("password", cleanPassword)
    .maybeSingle();

  if (coworker) {
    if (coworker.status === "Inactive") {
      throw new Error("Your account is currently inactive. Please contact the administrator.");
    }

    return {
      id: coworker.id,
      email: coworker.email,
      first_name: coworker.first_name,
      last_name: coworker.last_name,
      display_name: `${coworker.first_name} ${coworker.last_name}`,
      role: coworker.job_title || "Staff Member",
      account_type: "coworker",
      avatar_url: coworker.avatar_url,
    };
  }

  throw new Error("Invalid email or password. Please verify your credentials.");
}