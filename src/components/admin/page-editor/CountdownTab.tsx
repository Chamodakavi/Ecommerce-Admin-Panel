"use client";

import React from "react";
import ImageUpload from "@/components/common/ImageUpload";
import { CountdownConfig } from "./types";

interface CountdownTabProps {
  countdownConfig: CountdownConfig;
  setCountdownConfig: React.Dispatch<React.SetStateAction<CountdownConfig>>;
}

export default function CountdownTab({
  countdownConfig,
  setCountdownConfig,
}: CountdownTabProps) {
  const updateField = (field: keyof CountdownConfig, val: any) => {
    setCountdownConfig((prev) => ({ ...prev, [field]: val }));
  };

  // Convert ISO / String date to HTML datetime-local format (YYYY-MM-DDTHH:mm)
  const formatForDateTimeLocal = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 16);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold">Limited-Time Countdown Offer</h2>
          <p className="text-xs text-slate-400">
            Controls the countdown timer banner section on the storefront.
          </p>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={countdownConfig.isActive}
            onChange={(e) => updateField("isActive", e.target.checked)}
            className="rounded text-indigo-600"
          />
          Active
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product Image Upload */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-500">
              Product Display Image
            </label>
            {countdownConfig.productImageUrl && (
              <button
                type="button"
                onClick={() => updateField("productImageUrl", "")}
                className="text-xs text-red-600 hover:underline"
              >
                Remove Image
              </button>
            )}
          </div>
          <ImageUpload
            value={countdownConfig.productImageUrl}
            onChange={(url) => updateField("productImageUrl", url)}
          />
          <p className="text-[10px] text-slate-400">
            Transparent PNG or clean WEBP recommended for best look.
          </p>
        </div>

        {/* Right Column: Timer, Text & Action Details */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Top Badge Text
            </label>
            <input
              type="text"
              value={countdownConfig.badgeText}
              onChange={(e) => updateField("badgeText", e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
              placeholder="e.g. Don’t Miss!!"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Countdown Expiry Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formatForDateTimeLocal(countdownConfig.deadline)}
              onChange={(e) =>
                updateField("deadline", new Date(e.target.value).toISOString())
              }
              className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Main Headline
            </label>
            <input
              type="text"
              value={countdownConfig.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
              placeholder="e.g. Enhance Your Music Experience"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Description / Specs Subtext
            </label>
            <textarea
              rows={2}
              value={countdownConfig.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500 resize-y"
              placeholder="Brief product info..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Button Label
            </label>
            <input
              type="text"
              value={countdownConfig.buttonText}
              onChange={(e) => updateField("buttonText", e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
              placeholder="Check it Out!"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Target Redirect Link
            </label>
            <input
              type="text"
              value={countdownConfig.link}
              onChange={(e) => updateField("link", e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
              placeholder="/products/special-deal"
            />
          </div>
        </div>
      </div>
    </div>
  );
}