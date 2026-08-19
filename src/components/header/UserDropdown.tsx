"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { getOwnerProfile } from "@/functions/profile";
import { ChevronDown, User, Settings, HelpCircle, LogOut } from "lucide-react";

interface SessionUser {
  id?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  email?: string;
  role?: string;
  account_type?: "owner" | "coworker";
  avatar_url?: string | null;
}

export default function UserDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    // 1. Check for logged-in user stored during Sign In
    if (typeof window !== "undefined") {
      const storedSession =
        localStorage.getItem("user_session") ||
        localStorage.getItem("owner_session");

      if (storedSession) {
        try {
          const parsedUser: SessionUser = JSON.parse(storedSession);
          setUser(parsedUser);
          return;
        } catch (err) {
          console.error("Failed to parse stored session:", err);
        }
      }
    }

    // 2. Fallback: Fetch default profile if no explicit session is present
    async function fetchFallbackProfile() {
      try {
        const data = await getOwnerProfile();
        if (data) {
          setUser({
            first_name: data.first_name,
            last_name: data.last_name,
            display_name: data.display_name,
            email: data.email,
            role: data.role || "Owner",
            avatar_url: data.avatar_url,
          });
        }
      } catch (err: any) {
        console.error("Failed to load user info:", err.message);
      }
    }

    fetchFallbackProfile();
  }, []);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

 const handleSignOut = (e: React.MouseEvent) => {
  e.preventDefault();
  setIsOpen(false);

  if (typeof window !== "undefined") {
    localStorage.removeItem("user_session");
    localStorage.removeItem("owner_session");
    document.cookie = "user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }

  window.location.replace("/signin");
};

  const avatarSrc = user?.avatar_url || "/images/user/owner.jpg";
  const firstName = user?.first_name || "User";
  const fullName =
    user?.display_name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    "User";
  const email = user?.email || "user@premierautohub.com";
  const role = user?.role || "Staff Member";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleDropdown}
        className="dropdown-toggle flex items-center text-gray-700 dark:text-gray-400"
      >
        <span className="relative mr-3 h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
          <Image
            fill
            src={avatarSrc}
            alt="User avatar"
            className="object-cover"
          />
        </span>

        <span className="mr-1 block font-medium text-theme-sm">{firstName}</span>

        <ChevronDown
          className={`h-4 w-4 stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="shadow-theme-lg absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="border-b border-gray-100 px-2 pb-3 pt-1 dark:border-gray-800">
          <span className="block font-semibold text-gray-800 text-theme-sm dark:text-white/90">
            {fullName}
          </span>
          <span className="mt-0.5 block truncate text-theme-xs text-gray-500 dark:text-gray-400">
            {email}
          </span>
          <span className="mt-1.5 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {role}
          </span>
        </div>

        <ul className="flex flex-col gap-1 border-b border-gray-100 py-2 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="group flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <User className="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
              Edit Profile
            </DropdownItem>
          </li>

        
        </ul>

        <button
          type="button"
          onClick={handleSignOut}
          className="group mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-medium text-red-600 text-theme-sm transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}