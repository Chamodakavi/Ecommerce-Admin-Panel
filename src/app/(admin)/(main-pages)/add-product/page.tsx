"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ImageUpload from "@/components/common/ImageUpload"; 
import { createProduct } from "@/functions/products"; 

export default function AddProductPage() {
  // 1. Form state variables
  const [customId, setCustomId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stockQuantity, setStockQuantity] = useState<number>(1);
  const [availability, setAvailability] = useState("In Stock");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // Cloudinary image URL state

  const [loading, setLoading] = useState(false);

  // Counter handlers
  const handleIncrement = () => setStockQuantity((prev) => prev + 1);
  const handleDecrement = () =>
    setStockQuantity((prev) => (prev > 0 ? prev - 1 : 0));

  // 2. Submit Handler: Bundles image URL + all text inputs and saves to Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customId || !name || price === "") {
      alert("Please fill in Product ID, Name, and Price.");
      return;
    }

    if (!imageUrl) {
      alert("Please upload a product image first.");
      return;
    }

    setLoading(true);

    try {
      // Calls your functions/products.ts createProduct helper
      await createProduct({
        custom_product_id: customId,
        name: name,
        category: category,
        brand: brand,
        price: Number(price),
        stock_quantity: Number(stockQuantity),
        availability_status: availability,
        description: description,
        image_url: imageUrl, // Saves the Cloudinary CDN link directly to your Supabase table column
      });

      alert("Product successfully added to inventory!");

      // Optional: Reset form fields after successful save
      setCustomId("");
      setName("");
      setCategory("");
      setBrand("");
      setPrice("");
      setStockQuantity(1);
      setDescription("");
      setImageUrl("");
    } catch (error: any) {
      alert(`Failed to save product: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageBreadcrumb pageTitle="Add Products" />

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: Product Basic Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-6">
            Product Description
          </h3>

          <div className="space-y-4">
            {/* Custom Product ID & Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Custom Product ID (SKU) *
                </label>
                <input
                  type="text"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  placeholder="e.g. PART-AUDIO-001"
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pioneer 10-Inch Subwoofer"
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Category & Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                >
                  <option value="">Select Category</option>
                  <option value="Subwoofers">Subwoofers</option>
                  <option value="Amplifiers">Amplifiers</option>
                  <option value="Head Units">Head Units</option>
                  <option value="Speakers">Speakers</option>
                  <option value="Wiring & Accessories">Wiring & Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Brand
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                >
                  <option value="">Select Brand</option>
                  <option value="Pioneer">Pioneer</option>
                  <option value="JBL">JBL</option>
                  <option value="Sony">Sony</option>
                  <option value="Alpine">Alpine</option>
                  <option value="Kenwood">Kenwood</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description / Technical Specs
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter details, RMS wattage, compatibility..."
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 resize-y"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Pricing & Inventory */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-6">
            Pricing & Inventory
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="199.99"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
              />
            </div>

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
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Pre-Order">Pre-Order</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: Cloudinary Upload */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
            Product Image
          </h3>
          <ImageUpload
            value={imageUrl}
            onChange={(url) => setImageUrl(url)} // Captures Cloudinary secure_url string
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
}