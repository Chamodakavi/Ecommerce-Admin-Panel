"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";

interface CreatableSelectModalProps {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  onSelect: (value: string) => void;
  onCreateOption: (newOption: string) => Promise<string | void> | void;
  required?: boolean;
}

export default function CreatableSelectModal({
  label,
  value,
  options,
  placeholder,
  onSelect,
  onCreateOption,
  required = false,
}: CreatableSelectModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ADD_NEW_FLAG = "__ADD_NEW_ITEM__";

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === ADD_NEW_FLAG) {
      setIsOpen(true);
    } else {
      onSelect(selected);
    }
  };

  const handleSave = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const cleanTitle = newTitle.trim();
    if (!cleanTitle) return;

    try {
      setSubmitting(true);
      const created = await onCreateOption(cleanTitle);
      onSelect(created || cleanTitle);
      setNewTitle("");
      setIsOpen(false);
    } catch (err: any) {
      alert(`Failed to add ${label}: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Stop outer product form from submitting
      handleSave(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          {label} {required && "*"}
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <Plus className="h-3 w-3" />
          Add New
        </button>
      </div>

      <select
        value={value}
        onChange={handleDropdownChange}
        className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value={ADD_NEW_FLAG} className="font-semibold text-blue-600">
          + Add New {label}
        </option>
      </select>

      {/* Modal Dialog without nested <form> */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Create New {label}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setNewTitle("");
                  setIsOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {label} Name *
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder={`e.g. New ${label}`}
                  value={newTitle}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewTitle("");
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={submitting || !newTitle.trim()}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {submitting ? "Saving..." : `Save ${label}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}