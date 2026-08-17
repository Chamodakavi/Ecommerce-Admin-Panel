"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getCoworkers, deleteCoworker, Coworker } from "@/functions/coworkers";

export default function CoworkersPage() {
  const [coworkers, setCoworkers] = useState<Coworker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCoworkersData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await getCoworkers();
      setCoworkers(data);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to fetch co-workers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoworkersData();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this co-worker?"
    );
    if (!confirmDelete) return;

    try {
      await deleteCoworker(id);
      setCoworkers((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  };

  return (

    <div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
           
            <div className="space-y-6">
              <div className="py-6">
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Co-Workers
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage company team members, employee records, and credentials.
          </p>
        </div>
        <button
          onClick={() => {
            // Modal trigger or router push to create page
          }}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
        >
          + Add Co-Worker
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Loading & Empty State */}
      {loading ? (
        <div className="flex h-48 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          Loading co-workers...
        </div>
      ) : coworkers.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">
            No co-workers found. Click "+ Add Co-Worker" to add team members.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {coworkers.map((worker) => (
            <div
              key={worker.id}
              className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Profile Card Header */}
              <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={
                        worker.avatar_url ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500&auto=format&fit=crop"
                      }
                      alt={`${worker.first_name} ${worker.last_name}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {worker.first_name} {worker.last_name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <span>{worker.job_title}</span>
                      {worker.city_state && (
                        <>
                          <span>•</span>
                          <span>{worker.city_state}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      worker.status === "Active"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {worker.status || "Active"}
                  </span>
                  <button
                    onClick={() => {
                      // Trigger edit form modal/state
                    }}
                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(worker.id)}
                    className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Personal Information Section */}
              <div>
                <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      First Name
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {worker.first_name || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Last Name
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {worker.last_name || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Email address
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {worker.email || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Phone
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {worker.phone || "—"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Bio
                    </span>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {worker.bio || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="border-t border-gray-100 pt-6 dark:border-gray-800">
                <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Address
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Country
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {worker.country || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      City/State
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {worker.city_state || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Postal Code
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {worker.postal_code || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      TAX ID
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {worker.tax_id || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
            </div>
          </div>
        </div>

   
  );
}