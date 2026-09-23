"use client";

import React from "react";
import ImageUpload from "@/components/common/ImageUpload";
import { GeneralConfig } from "./types";

interface GeneralTabProps {
  generalConfig: GeneralConfig;
  setGeneralConfig: React.Dispatch<React.SetStateAction<GeneralConfig>>;
}

export default function GeneralTab({
  generalConfig,
  setGeneralConfig,
}: GeneralTabProps) {
  const updateField = (field: keyof GeneralConfig, val: string) => {
    setGeneralConfig((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="space-y-8">
      {/* 1. Brand Logo & SEO */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold">Brand & Header Settings</h2>
          <p className="text-xs text-slate-400">
            Upload your site logo and manage global meta tags.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logo Upload Slot */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-500">
                Company Logo
              </label>
              {generalConfig.logoUrl && (
                <button
                  type="button"
                  onClick={() => updateField("logoUrl", "")}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove Logo
                </button>
              )}
            </div>
            <ImageUpload
              value={generalConfig.logoUrl}
              onChange={(url) => updateField("logoUrl", url)}
            />
            <p className="text-[10px] text-slate-400">
              Recommended: Transparent PNG or SVG.
            </p>
          </div>

          {/* Meta Information */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Website Meta Title
              </label>
              <input
                type="text"
                value={generalConfig.pageMetaTitle}
                onChange={(e) => updateField("pageMetaTitle", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                placeholder="Premier Auto Hub | Reliability Assured"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Contact & Support Details */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold">Contact & Location Info</h2>
          <p className="text-xs text-slate-400">
            Controls the 24/7 hotline in the header and the footer Help & Support details.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Header 24/7 Support */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              24/7 Support Hotline (Header)
            </label>
            <input
              type="text"
              value={generalConfig.supportPhone247}
              onChange={(e) => updateField("supportPhone247", e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
              placeholder="(+965) 7492-3477"
            />
          </div>

          {/* Secondary / Landline Phone */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Telephone / Support Phone (Footer)
            </label>
            <input
              type="text"
              value={generalConfig.telephone}
              onChange={(e) => updateField("telephone", e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
              placeholder="(+099) 532-786-9843"
            />
          </div>

          {/* Email / Gmail */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Official Email / Gmail Address
            </label>
            <input
              type="email"
              value={generalConfig.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
              placeholder="support@premierautohub.com"
            />
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Physical Location / Address
            </label>
            <textarea
              rows={3}
              value={generalConfig.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500 resize-y"
              placeholder="685 Market Street, Las Vegas, LA 95820, United States."
            />
          </div>
        </div>
      </div>
    </div>
  );
}