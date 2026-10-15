"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ImageUpload from "@/components/common/ImageUpload";
import { createProduct } from "@/functions/products";
import CreatableSelectModal from "@/components/common/CreatableSelectModal";
import { getCategories, createCategory, deleteCategory } from "@/functions/categories";
import { getBrands, createBrand, deleteBrand } from "@/functions/brands";
import { Trash2 } from "lucide-react";

export default function AddProductPage() {
  // 1. Form state variables
  const [customId, setCustomId] = useState("");
  const [name, setName] = useState("");

  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("");

  const [brands, setBrands] = useState<string[]>([]);
  const [brand, setBrand] = useState("");

  const [deletingCategory, setDeletingCategory] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState(false);

  useEffect(() => {
    async function loadSelectOptions() {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (err: any) {
        console.error("Failed to load categories or brands:", err.message);
      }
    }

    loadSelectOptions();
  }, []);

  // Separate bought/cost price and selling price
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sellPrice, setSellPrice] = useState<number | "">("");

  const [stockQuantity, setStockQuantity] = useState<number>(1);
  const [availability, setAvailability] = useState("In Stock");
  const [description, setDescription] = useState("");

  // Maximum 3 Cloudinary image URLs
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Counter handlers
  const handleIncrement = () => setStockQuantity((prev) => prev + 1);
  const handleDecrement = () => setStockQuantity((prev) => (prev > 0 ? prev - 1 : 0));

  // Category dynamic handlers
  const handleAddCategory = async (newCat: string) => {
    const savedName = await createCategory(newCat);
    setCategories((prev) => [...prev, savedName]);
  };

  const handleDeleteSelectedCategory = async () => {
    if (!category) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete category "${category}" from database?`
    );
    if (!confirmDelete) return;

    try {
      setDeletingCategory(true);
      await deleteCategory(category);
      setCategories((prev) => prev.filter((item) => item !== category));
      setCategory("");
      alert("Category deleted successfully.");
    } catch (err: any) {
      alert(`Failed to delete category: ${err.message || err}`);
    } finally {
      setDeletingCategory(false);
    }
  };

  // Brand dynamic handlers
  const handleAddBrand = async (newBrand: string) => {
    const savedBrand = await createBrand(newBrand);
    setBrands((prev) => [...prev, savedBrand]);
    return savedBrand;
  };

  const handleDeleteSelectedBrand = async () => {
    if (!brand) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete brand "${brand}" from database?`
    );
    if (!confirmDelete) return;

    try {
      setDeletingBrand(true);
      await deleteBrand(brand);
      setBrands((prev) => prev.filter((item) => item !== brand));
      setBrand("");
      alert("Brand deleted successfully.");
    } catch (err: any) {
      alert(`Failed to delete brand: ${err.message || err}`);
    } finally {
      setDeletingBrand(false);
    }
  };

  // Add/replace an image in a specific slot
  const handleImageChange = (index: number, url: string) => {
    setImageUrls((prev) => {
      const updated = [...prev];
      if (url) {
        updated[index] = url;
      } else {
        updated.splice(index, 1);
      }
      return updated.filter(Boolean).slice(0, 3);
    });
  };

  // Delete an image
  const handleDeleteImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 2. Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customId || !name || costPrice === "" || sellPrice === "") {
      alert("Please fill in Product ID, Name, Bought Price, and Selling Price.");
      return;
    }

    if (imageUrls.length === 0) {
      alert("Please upload at least one product image.");
      return;
    }

    if (imageUrls.length > 3) {
      alert("You can upload a maximum of 3 images.");
      return;
    }

    setLoading(true);

    try {
      await createProduct({
        custom_product_id: customId,
        name: name,
        category: category,
        brand: brand,
        cost_price: Number(costPrice),
        selling_price: Number(sellPrice),
        stock_quantity: Number(stockQuantity),
        availability_status: availability,
        description: description,
        image_urls: imageUrls.slice(0, 3),
        image_url: imageUrls[0],
      });

      alert("Product successfully added to inventory!");

      setCustomId("");
      setName("");
      setCategory("");
      setBrand("");
      setCostPrice("");
      setSellPrice("");
      setStockQuantity(1);
      setAvailability("In Stock");
      setDescription("");
      setImageUrls([]);
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

            {/* Category & Brand with Delete Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <CreatableSelectModal
                      label="Category"
                      value={category}
                      options={categories}
                      placeholder="Select Category"
                      onSelect={(val) => setCategory(val)}
                      onCreateOption={handleAddCategory}
                    />
                  </div>

                  {category && (
                    <button
                      type="button"
                      onClick={handleDeleteSelectedCategory}
                      disabled={deletingCategory}
                      title={`Delete "${category}" from database`}
                      className="h-[42px] px-3 inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Brand */}
              <div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <CreatableSelectModal
                      label="Brand"
                      value={brand}
                      options={brands}
                      placeholder="Select Brand"
                      onSelect={(val) => setBrand(val)}
                      onCreateOption={handleAddBrand}
                    />
                  </div>

                  {brand && (
                    <button
                      type="button"
                      onClick={handleDeleteSelectedBrand}
                      disabled={deletingBrand}
                      title={`Delete "${brand}" from database`}
                      className="h-[42px] px-3 inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Bought Price *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={costPrice}
                onChange={(e) =>
                  setCostPrice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="100.00"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Selling Price *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={sellPrice}
                onChange={(e) =>
                  setSellPrice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="149.99"
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
                  min="0"
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                Product Images
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Upload up to 3 images. You can remove an image and upload another one.
              </p>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {imageUrls.length}/3
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Slot 1 */}
            <div className="relative">
              <div className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                Image 1 {imageUrls[0] ? "(Cover)" : ""}
              </div>
              {imageUrls[0] ? (
                <div className="relative">
                  <img
                    src={imageUrls[0]}
                    alt="Product image 1"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(0)}
                    className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition shadow"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <ImageUpload
                  value=""
                  onChange={(url) => handleImageChange(0, url)}
                />
              )}
            </div>

            {/* Slot 2 */}
            <div className="relative">
              <div className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                Image 2
              </div>
              {imageUrls[1] ? (
                <div className="relative">
                  <img
                    src={imageUrls[1]}
                    alt="Product image 2"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(1)}
                    className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition shadow"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <ImageUpload
                  value=""
                  onChange={(url) => handleImageChange(1, url)}
                />
              )}
            </div>

            {/* Slot 3 */}
            <div className="relative">
              <div className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                Image 3
              </div>
              {imageUrls[2] ? (
                <div className="relative">
                  <img
                    src={imageUrls[2]}
                    alt="Product image 3"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(2)}
                    className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition shadow"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <ImageUpload
                  value=""
                  onChange={(url) => handleImageChange(2, url)}
                />
              )}
            </div>
          </div>
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