"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import {
  Menu,
  X,
  MoreVertical,
  Search,
  Command,
} from "lucide-react";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm transition-colors dark:border-gray-800 dark:bg-gray-900/95">
      <div className="flex grow flex-col justify-between lg:flex-row lg:items-center lg:px-6">
        {/* Main Action Bar */}
        <div className="relative flex w-full items-center justify-between px-4 py-3 sm:gap-4 lg:w-auto lg:px-0 lg:py-3.5">
          {/* Left: Sidebar Toggle Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggle}
              aria-label="Toggle Sidebar"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              {isMobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Center: Mobile Logo (Exact Center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden">
            <Link href="/" className="flex items-center">
              <Image
                width={160}
                height={35}
                className="h-8 w-auto object-contain dark:hidden"
                src="/images/logo/adminHeadLogo.png"
                alt="Logo"
                priority
              />
              <Image
                width={140}
                height={35}
                className="hidden h-8 w-auto object-contain dark:block"
                src="/images/logo/adminHeadLogoDark.png"
                alt="Logo"
                priority
              />
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:block">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search or type command..."
                  className="h-10 w-64 rounded-lg border border-gray-200 bg-gray-50/50 py-2 pl-10 pr-14 text-xs text-gray-800 placeholder-gray-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-800 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:bg-gray-900 xl:w-96"
                />
                <kbd className="pointer-events-none absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-500 shadow-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </kbd>
              </div>
            </form>
          </div>

          {/* Right: Mobile Menu Trigger */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              type="button"
              onClick={toggleApplicationMenu}
              aria-label="Toggle Navigation Menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Collapsible Utility & Profile Actions */}
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } w-full flex-col gap-3 border-t border-gray-100 px-4 py-3 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between lg:flex lg:w-auto lg:flex-row lg:border-none lg:p-0`}
        >
          {/* Mobile Search Input */}
          <div className="relative w-full lg:hidden">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-xs text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-800 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
            <div className="flex items-center gap-2">
              <ThemeToggleButton />
              <NotificationDropdown />
            </div>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800" />
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;