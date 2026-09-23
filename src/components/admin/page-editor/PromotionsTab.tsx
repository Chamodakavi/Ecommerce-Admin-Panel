"use client";

import React from "react";
import ImageUpload from "@/components/common/ImageUpload";
import { PromoBannersConfig, BigPromoBanner, SmallPromoBanner } from "./types";

interface PromotionsTabProps {
  promoBanners: PromoBannersConfig;
  setPromoBanners: React.Dispatch<React.SetStateAction<PromoBannersConfig>>;
}

export default function PromotionsTab({
  promoBanners,
  setPromoBanners,
}: PromotionsTabProps) {
  const updateBigBanner = (field: keyof BigPromoBanner, val: any) => {
    setPromoBanners((prev) => ({
      ...prev,
      bigBanner: { ...prev.bigBanner, [field]: val },
    }));
  };

  const updateSmallBanner = (idx: number, field: keyof SmallPromoBanner, val: any) => {
    setPromoBanners((prev) => {
      const updated = [...prev.smallBanners];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, smallBanners: updated };
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Large Top Promo Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold">Main Banner (Big Top Banner)</h2>
            <p className="text-xs text-slate-400">Controls the full-width promotional banner.</p>
          </div>
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={promoBanners.bigBanner.isActive}
              onChange={(e) => updateBigBanner("isActive", e.target.checked)}
              className="rounded text-indigo-600"
            />
            Active
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-500">Banner Image</label>
              {promoBanners.bigBanner.imageUrl && (
                <button
                  type="button"
                  onClick={() => updateBigBanner("imageUrl", "")}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove Image
                </button>
              )}
            </div>
            <ImageUpload
              value={promoBanners.bigBanner.imageUrl}
              onChange={(url) => updateBigBanner("imageUrl", url)}
            />
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Subtitle / Product Name</label>
              <input
                type="text"
                value={promoBanners.bigBanner.subtitle}
                onChange={(e) => updateBigBanner("subtitle", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                placeholder="e.g. Apple iPhone 14 Plus"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Headline / Offer Title</label>
              <input
                type="text"
                value={promoBanners.bigBanner.title}
                onChange={(e) => updateBigBanner("title", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                placeholder="e.g. UP TO 30% OFF"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Button Text</label>
              <input
                type="text"
                value={promoBanners.bigBanner.buttonText}
                onChange={(e) => updateBigBanner("buttonText", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                placeholder="Buy Now"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Target Redirect Link</label>
              <input
                type="text"
                value={promoBanners.bigBanner.link}
                onChange={(e) => updateBigBanner("link", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                placeholder="/products/iphone-14-plus"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
              <textarea
                rows={3}
                value={promoBanners.bigBanner.description}
                onChange={(e) => updateBigBanner("description", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500 resize-y"
                placeholder="Promotional details..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dual Secondary Promo Cards */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold">Bottom Promo Grid (2 Cards)</h2>
          <p className="text-xs text-slate-400">Controls the split promo boxes below the main banner.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promoBanners.smallBanners.map((card, idx) => (
            <div key={card.id || idx} className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-semibold text-sm text-slate-700">Promo Box #{idx + 1}</span>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={card.isActive}
                    onChange={(e) => updateSmallBanner(idx, "isActive", e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  Active
                </label>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-500">Banner Image</label>
                  {card.imageUrl && (
                    <button
                      type="button"
                      onClick={() => updateSmallBanner(idx, "imageUrl", "")}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
                <ImageUpload
                  value={card.imageUrl}
                  onChange={(url) => updateSmallBanner(idx, "imageUrl", url)}
                />
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Subtitle / Category</label>
                  <input
                    type="text"
                    value={card.subtitle}
                    onChange={(e) => updateSmallBanner(idx, "subtitle", e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                    placeholder="e.g. Foldable Motorised Treadmill"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => updateSmallBanner(idx, "title", e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                    placeholder="e.g. Workout At Home"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Highlight / Offer Tag</label>
                  <input
                    type="text"
                    value={card.highlightText}
                    onChange={(e) => updateSmallBanner(idx, "highlightText", e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                    placeholder="e.g. Flat 20% off"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Short Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={card.description || ""}
                    onChange={(e) => updateSmallBanner(idx, "description", e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500 resize-y"
                    placeholder="Brief description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={card.buttonText}
                      onChange={(e) => updateSmallBanner(idx, "buttonText", e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                      placeholder="Grab Now"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Redirect Link</label>
                    <input
                      type="text"
                      value={card.link}
                      onChange={(e) => updateSmallBanner(idx, "link", e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                      placeholder="/products/deal"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}