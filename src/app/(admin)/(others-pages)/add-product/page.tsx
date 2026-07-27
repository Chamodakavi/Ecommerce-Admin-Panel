"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function AddProductPage() {
  const [stockQuantity, setStockQuantity] = useState<number>(1);

  const handleIncrement = () => setStockQuantity((prev) => prev + 1);
  const handleDecrement = () =>
    setStockQuantity((prev) => (prev > 0 ? prev - 1 : 0));

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Header */}
      <PageBreadcrumb pageTitle="Add Products" />

      {/* Main Form Container */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        
        {/* SECTION 1: Products Description */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-6">
            Products Description
          </h3>

          <div className="space-y-4">
            {/* Row 1: Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Category
                </label>
                <select className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400">
                  <option value="">Select a category</option>
                  <option value="laptop">Laptop</option>
                  <option value="phone">Phone</option>
                  <option value="audio">Audio</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
            </div>

            {/* Row 2: Brand & Color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Brand
                </label>
                <select className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400">
                  <option value="">Select brand</option>
                  <option value="apple">Apple</option>
                  <option value="asus">ASUS</option>
                  <option value="dell">Dell</option>
                  <option value="google">Google</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Color
                </label>
                <select className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400">
                  <option value="">Select color</option>
                  <option value="black">Black</option>
                  <option value="silver">Silver</option>
                  <option value="space-gray">Space Gray</option>
                </select>
              </div>
            </div>

            {/* Row 3: Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Weight(KG)
                </label>
                <input
                  type="text"
                  defaultValue="15"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Length(CM)
                </label>
                <input
                  type="text"
                  defaultValue="120"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Width(CM)
                </label>
                <input
                  type="text"
                  defaultValue="23"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Row 4: Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Receipt Info (optional)"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 resize-y"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Pricing & Availability */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-6">
            Pricing & Availability
          </h3>

          <div className="space-y-4">
            {/* Row 1: Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Weight(KG)
                </label>
                <input
                  type="text"
                  defaultValue="15"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Length(CM)
                </label>
                <input
                  type="text"
                  defaultValue="120"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Width(CM)
                </label>
                <input
                  type="text"
                  defaultValue="23"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Row 2: Stock Quantity & Availability Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Stock Quantity
                </label>
                <div className="flex items-center w-full border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="px-4 py-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition"
                  >
                    &#8722;
                  </button>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full text-center text-xs py-2.5 bg-white border-none outline-none dark:bg-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="px-4 py-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition"
                  >
                    &#43;
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Availability Status
                </label>
                <select className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400">
                  <option value="">Select a Availability</option>
                  <option value="in_stock">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="pre_order">Pre-Order</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Products Images */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-6">
            Products Images
          </h3>

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center dark:border-gray-700 hover:border-blue-500 transition cursor-pointer bg-gray-50/50 dark:bg-gray-900/30">
            <div className="w-10 h-10 mb-3 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-800 dark:text-white">
                Click to upload
              </span>{" "}
              or drag and drop SVG, PNG, JPG or GIF (MAX. 800x400px)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            className="px-5 py-2.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition"
          >
            Draft
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Publish Product
          </button>
        </div>
      </form>
    </div>
  );
}