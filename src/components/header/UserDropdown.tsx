"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { getOwnerProfile, OwnerProfile } from "@/functions/profile";
import { ChevronDown, User, Settings, HelpCircle, LogOut } from "lucide-react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<OwnerProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getOwnerProfile();
        if (data) {
          setProfile(data);
        }
      } catch (err: any) {
        console.error("Failed to load user profile in dropdown:", err.message);
      }
    }

    loadProfile();
  }, []);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const avatarSrc = profile?.avatar_url || "/images/user/owner.jpg";
  const firstName = profile?.first_name || "Owner";
  const fullName =
    profile?.display_name ||
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    "Owner";
  const email = profile?.email || "owner@premierautohub.com";

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="dropdown-toggle flex items-center text-gray-700 dark:text-gray-400"
      >
        <span className="relative mr-3 h-11 w-11 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
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
        <div className="px-2 py-1.5">
          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
            {fullName}
          </span>
          <span className="mt-0.5 block truncate text-theme-xs text-gray-500 dark:text-gray-400">
            {email}
          </span>
        </div>

        <ul className="flex flex-col gap-1 border-b border-gray-200 pb-3 pt-3 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="group flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <User className="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
              Edit profile
            </DropdownItem>
          </li>
          
        </ul>

        <Link
          href="/signin"
          onClick={closeDropdown}
          className="group mt-2 flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-red-600 text-theme-sm transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
          Sign out
        </Link>
      </Dropdown>
    </div>
  );
}