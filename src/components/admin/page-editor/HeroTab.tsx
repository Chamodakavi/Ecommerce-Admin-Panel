"use client";

import React from "react";
import ImageUpload from "@/components/common/ImageUpload";
import { CarouselSlide, PromoCard } from "@/components/admin/page-editor/types";

interface HeroTabProps {
  slides: CarouselSlide[];
  setSlides: React.Dispatch<React.SetStateAction<CarouselSlide[]>>;
  promos: PromoCard[];
  setPromos: React.Dispatch<React.SetStateAction<PromoCard[]>>;
}

export default function HeroTab({ slides, setSlides, promos, setPromos }: HeroTabProps) {
  const updateSlide = (idx: number, field: keyof CarouselSlide, val: any) => {
    const updated = [...slides];
    updated[idx] = { ...updated[idx], [field]: val };
    setSlides(updated);
  };

  const addSlide = () => {
    setSlides([
      ...slides,
      {
        id: Date.now(),
        title: "",
        discountText: "10%",
        description: "",
        buttonText: "Shop Now",
        link: "#",
        imageUrl: "",
        isActive: true,
      },
    ]);
  };

  const removeSlide = (idx: number) => {
    setSlides(slides.filter((_, i) => i !== idx));
  };

  const updatePromo = (idx: number, field: keyof PromoCard, val: any) => {
    const updated = [...promos];
    updated[idx] = { ...updated[idx], [field]: val };
    setPromos(updated);
  };

  return (
    <div className="space-y-8">
      {/* Carousel Slides Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Main Carousel Slides</h2>
            <p className="text-xs text-slate-400">Controls the left slider on the storefront home page.</p>
          </div>
          <button
            type="button"
            onClick={addSlide}
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md transition"
          >
            Save All Changes
          </button>
        </div>

        <div className="space-y-6">
          {slides.map((slide, idx) => (
            <div key={slide.id} className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-semibold text-sm text-slate-700">Slide #{idx + 1}</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slide.isActive}
                      onChange={(e) => updateSlide(idx, "isActive", e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    Active
                  </label>
                  {slides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlide(idx)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove Slide
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-500">Slide Image</label>
                    {slide.imageUrl && (
                      <button
                        type="button"
                        onClick={() => updateSlide(idx, "imageUrl", "")}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                  <ImageUpload
                    value={slide.imageUrl}
                    onChange={(url) => updateSlide(idx, "imageUrl", url)}
                  />
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Discount / Badge Text</label>
                    <input
                      type="text"
                      value={slide.discountText}
                      onChange={(e) => updateSlide(idx, "discountText", e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                      placeholder="e.g. 30%"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={slide.buttonText}
                      onChange={(e) => updateSlide(idx, "buttonText", e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                      placeholder="Shop Now"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Product Title</label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => updateSlide(idx, "title", e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                      placeholder="Product Headline"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Target Redirect Link</label>
                    <input
                      type="text"
                      value={slide.link}
                      onChange={(e) => updateSlide(idx, "link", e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                      placeholder="/products/category-name"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Short Description</label>
                    <textarea
                      rows={3}
                      value={slide.description}
                      onChange={(e) => updateSlide(idx, "description", e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500 resize-y"
                      placeholder="Briefly describe the promotional product..."
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side Promo Cards Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
         <div>
              <h2 className="text-lg font-bold">Right-Side Promo Cards</h2>
              <p className="text-xs text-slate-400">Controls the stacked product cards next to the slider.</p>
         </div>

               <button
            type="button"
            onClick={addSlide}
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md transition"
          >
            Save All Changes
          </button>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promos.map((promo, idx) => (
            <div key={promo.id} className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-semibold text-sm text-slate-700">Promo Box #{idx + 1}</span>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promo.isActive}
                    onChange={(e) => updatePromo(idx, "isActive", e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  Active
                </label>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-500">Product Image</label>
                  {promo.imageUrl && (
                    <button
                      type="button"
                      onClick={() => updatePromo(idx, "imageUrl", "")}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
                <ImageUpload
                  value={promo.imageUrl}
                  onChange={(url) => updatePromo(idx, "imageUrl", url)}
                />
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Product Title</label>
                  <input
                    type="text"
                    value={promo.title}
                    onChange={(e) => updatePromo(idx, "title", e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={promo.badgeText}
                    onChange={(e) => updatePromo(idx, "badgeText", e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                    placeholder="e.g. limited time offer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Sale Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={promo.salePrice}
                      onChange={(e) => updatePromo(idx, "salePrice", Number(e.target.value))}
                      className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Regular Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={promo.regularPrice}
                      onChange={(e) => updatePromo(idx, "regularPrice", Number(e.target.value))}
                      className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Target Redirect Link</label>
                  <input
                    type="text"
                    value={promo.link}
                    onChange={(e) => updatePromo(idx, "link", e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
                    placeholder="/products/product-slug"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}