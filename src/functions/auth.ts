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

/**
 * Checks whether the currently signed-in user is a Store Owner.
 * Reads directly from the user_session key in localStorage and cookies.
 */
export function isCurrentUserOwner(): boolean {
  if (typeof window === "undefined") return false;

  try {
    // 1. Check localStorage['user_session']
    const storedSession = localStorage.getItem("user_session");
    if (storedSession) {
      const parsed = JSON.parse(storedSession);
      const isOwnerAccount = parsed?.account_type?.toLowerCase() === "owner";
      const isOwnerRole = parsed?.role?.toLowerCase()?.includes("owner");
      if (isOwnerAccount || isOwnerRole) return true;
    }

    // 2. Check document.cookie['user_session']
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const cookieSession = getCookie("user_session");
    if (cookieSession) {
      const parsedCookie = JSON.parse(cookieSession);
      const isOwnerAccount = parsedCookie?.account_type?.toLowerCase() === "owner";
      const isOwnerRole = parsedCookie?.role?.toLowerCase()?.includes("owner");
      if (isOwnerAccount || isOwnerRole) return true;
    }

    return false;
  } catch (err) {
    console.error("isCurrentUserOwner check error:", err);
    return false;
  }
}