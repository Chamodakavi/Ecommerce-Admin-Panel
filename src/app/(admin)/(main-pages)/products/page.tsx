"use client";

import React, { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ImageUpload from "@/components/common/ImageUpload";
import Badge from "@/components/ui/badge/Badge";
import {
  Search,
  RefreshCw,
  Loader2,
  X,
  Trash2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

import {
  getProducts,
  updateProduct,
  deleteProduct,
} from "@/functions/products";

type ImageSlots = [
  string | null,
  string | null,
  string | null
];

interface Product {
  id: string;
  custom_product_id?: string | null;
  name?: string | null;
  category?: string | null;
  brand?: string | null;

  cost_price?: number | null;
  selling_price?: number | null;

  stock_quantity?: number | null;

  availability_status?: string | null;
  description?: string | null;

  image_urls?: string[] | null;
  image_url?: string | null;
}

const EMPTY_IMAGE_SLOTS: ImageSlots = [
  null,
  null,
  null,
];

export default function ProductsPage() {
  // =========================================================
  // Products
  // =========================================================

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  // =========================================================
  // Search / Selection
  // =========================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] =
    useState<string[]>([]);

  // =========================================================
  // Edit Modal
  // =========================================================

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);

  // =========================================================
  // Form
  // =========================================================

  const [customId, setCustomId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");

  const [costPrice, setCostPrice] =
    useState<number | "">("");

  const [sellPrice, setSellPrice] =
    useState<number | "">("");

  const [stockQuantity, setStockQuantity] =
    useState<number>(0);

  const [availability, setAvailability] =
    useState("In Stock");

  const [description, setDescription] =
    useState("");

  const [imageUrls, setImageUrls] =
    useState<ImageSlots>([
      ...EMPTY_IMAGE_SLOTS,
    ]);

  // =========================================================
  // Fetch Products
  // =========================================================

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const data = await getProducts();

      setProducts((data || []) as Product[]);
    } catch (error: any) {
      console.error(
        "Error fetching products:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // Search
  // =========================================================

  const filteredProducts = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name
          ?.toLowerCase()
          .includes(query) ||
        product.custom_product_id
          ?.toLowerCase()
          .includes(query) ||
        product.category
          ?.toLowerCase()
          .includes(query) ||
        product.brand
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [products, searchQuery]);

  // =========================================================
  // Image Helpers
  // =========================================================

  const getProductImages = (
    product: Product
  ): ImageSlots => {
    const images =
      Array.isArray(product.image_urls) &&
      product.image_urls.length > 0
        ? product.image_urls
        : product.image_url
          ? [product.image_url]
          : [];

    return [
      images[0] || null,
      images[1] || null,
      images[2] || null,
    ];
  };

  const getValidImages = () => {
    return imageUrls.filter(
      (url): url is string => Boolean(url)
    );
  };

  // =========================================================
  // Open Edit
  // =========================================================

  const handleOpenEdit = (
    product: Product
  ) => {
    setEditingProduct(product);

    setCustomId(
      product.custom_product_id || ""
    );

    setName(product.name || "");
    setCategory(product.category || "");
    setBrand(product.brand || "");

    setCostPrice(
      product.cost_price !== null &&
      product.cost_price !== undefined
        ? Number(product.cost_price)
        : ""
    );

    setSellPrice(
      product.selling_price !== null &&
      product.selling_price !== undefined
        ? Number(product.selling_price)
        : ""
    );

    setStockQuantity(
      Number(product.stock_quantity) || 0
    );

    setAvailability(
      product.availability_status ||
        "In Stock"
    );

    setDescription(
      product.description || ""
    );

    setImageUrls(
      getProductImages(product)
    );

    setIsEditOpen(true);
  };

  // =========================================================
  // Close Edit
  // =========================================================

  const handleCloseEdit = () => {
    if (isUpdating) return;

    setIsEditOpen(false);
    setEditingProduct(null);

    resetEditForm();
  };

  // =========================================================
  // Reset Form
  // =========================================================

  const resetEditForm = () => {
    setCustomId("");
    setName("");
    setCategory("");
    setBrand("");

    setCostPrice("");
    setSellPrice("");

    setStockQuantity(0);

    setAvailability("In Stock");

    setDescription("");

    setImageUrls([
      ...EMPTY_IMAGE_SLOTS,
    ]);
  };

  // =========================================================
  // Image Change
  // =========================================================

  const handleImageChange = (
    index: number,
    url: string
  ) => {
    if (index < 0 || index > 2) return;

    setImageUrls((previous) => {
      const updated = [
        ...previous,
      ] as ImageSlots;

      updated[index] = url || null;

      return updated;
    });
  };

  // =========================================================
  // Delete Image
  // =========================================================

  const handleDeleteImage = (
    index: number
  ) => {
    if (index < 0 || index > 2) return;

    setImageUrls((previous) => {
      const updated = [
        ...previous,
      ] as ImageSlots;

      updated[index] = null;

      return updated;
    });
  };

  // =========================================================
  // Profit
  // =========================================================

  const numericCost =
    Number(costPrice) || 0;

  const numericSelling =
    Number(sellPrice) || 0;

  const estimatedProfit =
    numericSelling - numericCost;

  const profitMargin =
    numericCost > 0
      ? (estimatedProfit / numericCost) *
        100
      : null;

  // =========================================================
  // Update Product
  // =========================================================

  const handleUpdateProduct = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!editingProduct) return;

    if (
      !customId.trim() ||
      !name.trim() ||
      costPrice === "" ||
      sellPrice === ""
    ) {
      alert(
        "Please fill in Product ID, Name, Bought Price, and Selling Price."
      );
      return;
    }

    const validImages =
      getValidImages();

    if (validImages.length === 0) {
      alert(
        "Please upload at least one product image."
      );
      return;
    }

    if (validImages.length > 3) {
      alert(
        "You can upload a maximum of 3 images."
      );
      return;
    }

    try {
      setIsUpdating(true);

      await updateProduct(
        editingProduct.id,
        {
          custom_product_id:
            customId.trim(),

          name: name.trim(),

         category: category || undefined,
brand: brand || undefined,

          cost_price:
            Number(costPrice),

          selling_price:
            Number(sellPrice),

          stock_quantity: Math.max(
            0,
            Number(stockQuantity) || 0
          ),

          availability_status:
            availability,

          description:
            description.trim() || undefined,

          image_urls:
            validImages.slice(0, 3),

          image_url:
            validImages[0],
        }
      );

      await fetchProducts();

      alert(
        "Product updated successfully."
      );

      handleCloseEdit();
    } catch (error: any) {
      console.error(
        "Error updating product:",
        error
      );

      alert(
        "Failed to update product: " +
          (error?.message ||
            "Unknown error")
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // =========================================================
  // Delete Product
  // =========================================================

  const handleDeleteProduct = async () => {
    if (!editingProduct) return;

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${editingProduct.name || "this product"}"?`
      );

    if (!confirmed) return;

    try {
      setIsUpdating(true);

      await deleteProduct(
        editingProduct.id
      );

      setProducts((previous) =>
        previous.filter(
          (product) =>
            product.id !==
            editingProduct.id
        )
      );

      setSelectedItems((previous) =>
        previous.filter(
          (id) =>
            id !== editingProduct.id
        )
      );

      alert(
        "Product deleted successfully."
      );

      handleCloseEdit();
    } catch (error: any) {
      console.error(
        "Error deleting product:",
        error
      );

      alert(
        "Failed to delete product: " +
          (error?.message ||
            "Unknown error")
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // =========================================================
  // Select Row
  // =========================================================

  const handleSelectRow = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    event.stopPropagation();

    setSelectedItems((previous) => {
      if (previous.includes(id)) {
        return previous.filter(
          (itemId) =>
            itemId !== id
        );
      }

      return [
        ...previous,
        id,
      ];
    });
  };

  // =========================================================
  // Select All
  // =========================================================

  const handleSelectAll = () => {
    const filteredIds =
      filteredProducts.map(
        (product) => product.id
      );

    const allSelected =
      filteredIds.length > 0 &&
      filteredIds.every((id) =>
        selectedItems.includes(id)
      );

    if (allSelected) {
      setSelectedItems((previous) =>
        previous.filter(
          (id) =>
            !filteredIds.includes(id)
        )
      );
    } else {
      setSelectedItems((previous) => [
        ...new Set([
          ...previous,
          ...filteredIds,
        ]),
      ]);
    }
  };

  const allFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every(
      (product) =>
        selectedItems.includes(
          product.id
        )
    );

  // =========================================================
  // Render
  // =========================================================

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="My Products" />

      {/* =====================================================
          PRODUCTS CARD
      ===================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">

        {/* Header */}
        <div className="border-b border-gray-100 p-5 dark:border-white/[0.05]">

          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                Products List
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click any product to view and
                edit its details.
              </p>
            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={fetchProducts}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 text-blue-600 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>

              <a
                href="/add-product"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
              >
                <span className="text-base font-bold">
                  +
                </span>

                Add Product
              </a>

            </div>
          </div>

          {/* Search */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search SKU, name, brand, category..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-xs text-gray-800 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="m-5 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />

            <span>
              {errorMessage}
            </span>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">

            <thead className="border-b border-gray-100 bg-gray-50 text-gray-500 dark:border-white/[0.05] dark:bg-gray-800/50 dark:text-gray-400">

              <tr>

                <th className="w-10 px-5 py-3.5">
                  <input
                    type="checkbox"
                    checked={
                      allFilteredSelected
                    }
                    onChange={
                      handleSelectAll
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                  />
                </th>

                <th className="px-5 py-3.5 font-semibold">
                  Product
                </th>

                <th className="px-5 py-3.5 font-semibold">
                  Category
                </th>

                <th className="px-5 py-3.5 font-semibold">
                  Brand
                </th>

                <th className="px-5 py-3.5 font-semibold">
                  Selling Price
                </th>

                <th className="px-5 py-3.5 font-semibold">
                  Stock
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">

              {/* Loading */}
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-gray-400"
                  >
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-blue-600" />

                    Loading products...
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading &&
                filteredProducts.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-gray-400"
                    >
                      {searchQuery
                        ? "No products match your search."
                        : 'No products found. Click "Add Product" to create one.'}
                    </td>
                  </tr>
                )}

              {/* Products */}
              {!loading &&
                filteredProducts.map(
                  (product) => {
                    const coverImage =
                      product
                        .image_urls?.[0] ||
                      product.image_url ||
                      null;

                    const stock =
                      Number(
                        product.stock_quantity
                      ) || 0;

                    return (
                      <tr
                        key={product.id}
                        onClick={() =>
                          handleOpenEdit(
                            product
                          )
                        }
                        className="cursor-pointer transition hover:bg-blue-50/40 dark:hover:bg-white/[0.02]"
                      >

                        {/* Checkbox */}
                        <td
                          className="px-5 py-4"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(
                              product.id
                            )}
                            onChange={(
                              event
                            ) =>
                              handleSelectRow(
                                event,
                                product.id
                              )
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                          />
                        </td>

                        {/* Product */}
                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">

                              {coverImage ? (
                                <Image
                                  src={
                                    coverImage
                                  }
                                  alt={
                                    product.name ||
                                    "Product"
                                  }
                                  width={40}
                                  height={40}
                                  className="h-full w-full object-contain p-1"
                                />
                              ) : (
                                <span className="text-[9px] text-gray-400">
                                  No Img
                                </span>
                              )}

                            </div>

                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {product.name ||
                                  "Unnamed Product"}
                              </div>

                              {product.custom_product_id && (
                                <div className="mt-0.5 text-[10px] text-gray-400">
                                  SKU:{" "}
                                  {
                                    product.custom_product_id
                                  }
                                </div>
                              )}
                            </div>

                          </div>

                        </td>

                        {/* Category */}
                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                          {product.category ||
                            "—"}
                        </td>

                        {/* Brand */}
                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                          {product.brand ||
                            "—"}
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                          LKR{" "}
                          {Number(
                            product.selling_price
                          ).toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </td>

                        {/* Stock */}
                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <Badge
                              size="sm"
                              color={
                                stock > 0
                                  ? "success"
                                  : "error"
                              }
                            >
                              {stock > 0
                                ? "In Stock"
                                : "Out of Stock"}
                            </Badge>

                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {stock}
                            </span>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 p-4 text-xs text-gray-500 dark:border-white/[0.05]">

          <span>
            Showing{" "}
            <strong className="text-gray-700 dark:text-gray-300">
              {filteredProducts.length}
            </strong>{" "}
            products
          </span>

          {selectedItems.length >
            0 && (
            <span>
              {selectedItems.length} selected
            </span>
          )}

        </div>
      </div>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {isEditOpen &&
        editingProduct && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">

            <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Edit Product
                  </h3>

                  <p className="text-xs text-gray-400">
                    Update product information,
                    pricing, stock and images.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleCloseEdit
                  }
                  disabled={
                    isUpdating
                  }
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* Form */}
              <form
                onSubmit={
                  handleUpdateProduct
                }
                className="space-y-6 pt-5"
              >

                {/* =================================================
                    PRODUCT INFORMATION
                ================================================= */}

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/40">

                  <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-white/90">
                    Product Information
                  </h4>

                  <div className="space-y-4">

                    {/* SKU + Name */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Product ID / SKU *
                        </label>

                        <input
                          type="text"
                          required
                          value={customId}
                          onChange={(
                            event
                          ) =>
                            setCustomId(
                              event.target
                                .value
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Product Name *
                        </label>

                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(
                            event
                          ) =>
                            setName(
                              event.target
                                .value
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </div>

                    </div>

                    {/* Category + Brand */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Category
                        </label>

                        <select
                          value={
                            category
                          }
                          onChange={(
                            event
                          ) =>
                            setCategory(
                              event.target
                                .value
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                        >
                          <option value="">
                            Select Category
                          </option>

                          <option value="Subwoofers">
                            Subwoofers
                          </option>

                          <option value="Amplifiers">
                            Amplifiers
                          </option>

                          <option value="Head Units">
                            Head Units
                          </option>

                          <option value="Speakers">
                            Speakers
                          </option>

                          <option value="Lubricants & Oils">
                            Lubricants & Oils
                          </option>

                          <option value="Braking Systems">
                            Braking Systems
                          </option>

                          <option value="Wiring & Accessories">
                            Wiring & Accessories
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Brand
                        </label>

                        <select
                          value={brand}
                          onChange={(
                            event
                          ) =>
                            setBrand(
                              event.target
                                .value
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                        >
                          <option value="">
                            Select Brand
                          </option>

                          <option value="Pioneer">
                            Pioneer
                          </option>

                          <option value="JBL">
                            JBL
                          </option>

                          <option value="Sony">
                            Sony
                          </option>

                          <option value="Alpine">
                            Alpine
                          </option>

                          <option value="Kenwood">
                            Kenwood
                          </option>

                          <option value="Mobil 1">
                            Mobil 1
                          </option>

                          <option value="Toyota Genuine">
                            Toyota Genuine
                          </option>

                          <option value="Brembo">
                            Brembo
                          </option>
                        </select>
                      </div>

                    </div>

                    {/* Description */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Description / Technical Specs
                      </label>

                      <textarea
                        rows={4}
                        value={
                          description
                        }
                        onChange={(
                          event
                        ) =>
                          setDescription(
                            event.target
                              .value
                          )
                        }
                        className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                      />
                    </div>

                  </div>
                </div>

                {/* =================================================
                    PRICING & INVENTORY
                ================================================= */}

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/40">

                  <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-white/90">
                    Pricing & Inventory
                  </h4>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

                    {/* Cost */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Bought Price *
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={
                          costPrice
                        }
                        onChange={(
                          event
                        ) =>
                          setCostPrice(
                            event.target
                              .value ===
                              ""
                              ? ""
                              : Number(
                                  event
                                    .target
                                    .value
                                )
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                      />
                    </div>

                    {/* Selling */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Selling Price *
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={
                          sellPrice
                        }
                        onChange={(
                          event
                        ) =>
                          setSellPrice(
                            event.target
                              .value ===
                              ""
                              ? ""
                              : Number(
                                  event
                                    .target
                                    .value
                                )
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                      />
                    </div>

                    {/* Stock */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Stock Quantity
                      </label>

                      <div className="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">

                        <button
                          type="button"
                          onClick={() =>
                            setStockQuantity(
                              (
                                previous
                              ) =>
                                Math.max(
                                  0,
                                  previous -
                                    1
                                )
                            )
                          }
                          className="bg-gray-50 px-3 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                        >
                          −
                        </button>

                        <input
                          type="number"
                          min="0"
                          value={
                            stockQuantity
                          }
                          onChange={(
                            event
                          ) =>
                            setStockQuantity(
                              Math.max(
                                0,
                                Number(
                                  event
                                    .target
                                    .value
                                ) || 0
                              )
                            )
                          }
                          className="w-full border-none bg-white text-center text-xs outline-none dark:bg-gray-900 dark:text-white"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setStockQuantity(
                              (
                                previous
                              ) =>
                                previous +
                                1
                            )
                          }
                          className="bg-gray-50 px-3 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                        >
                          +
                        </button>

                      </div>
                    </div>

                    {/* Availability */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Availability
                      </label>

                      <select
                        value={
                          availability
                        }
                        onChange={(
                          event
                        ) =>
                          setAvailability(
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                      >
                        <option value="In Stock">
                          In Stock
                        </option>

                        <option value="Out of Stock">
                          Out of Stock
                        </option>

                        <option value="Pre-Order">
                          Pre-Order
                        </option>
                      </select>
                    </div>

                  </div>

                  {/* Profit */}
                  {costPrice !== "" &&
                    sellPrice !== "" && (
                      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg bg-blue-50/60 p-3 text-xs dark:bg-blue-900/20">

                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-4 w-4 text-emerald-600" />

                          <span className="text-gray-600 dark:text-gray-300">
                            Estimated Gross
                            Profit:
                          </span>

                          <strong
                            className={
                              estimatedProfit >=
                              0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }
                          >
                            {estimatedProfit >=
                            0
                              ? "+"
                              : ""}
                            LKR{" "}
                            {estimatedProfit.toFixed(
                              2
                            )}
                          </strong>
                        </div>

                        {profitMargin !==
                          null && (
                          <span className="text-gray-500">
                            Margin:{" "}
                            <strong>
                              {profitMargin.toFixed(
                                1
                              )}
                              %
                            </strong>
                          </span>
                        )}

                      </div>
                    )}

                </div>

                {/* =================================================
                    IMAGES
                ================================================= */}

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/40">

                  <div className="mb-4 flex items-center justify-between">

                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-white/90">
                        Product Images
                      </h4>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Maximum 3 images.
                      </p>
                    </div>

                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {
                        getValidImages()
                          .length
                      }
                      /3
                    </span>

                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    {[0, 1, 2].map(
                      (index) => {
                        const image =
                          imageUrls[
                            index
                          ];

                        return (
                          <div
                            key={
                              index
                            }
                          >

                            <div className="mb-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                              Image{" "}
                              {index +
                                1}

                              {index ===
                                0 &&
                                image &&
                                " (Cover)"}
                            </div>

                            {image ? (
                              <div className="relative overflow-hidden rounded-lg">

                                <img
                                  src={
                                    image
                                  }
                                  alt={`Product image ${
                                    index +
                                    1
                                  }`}
                                  className="h-40 w-full rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteImage(
                                      index
                                    )
                                  }
                                  disabled={
                                    isUpdating
                                  }
                                  className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white shadow hover:bg-red-700 disabled:opacity-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>

                              </div>
                            ) : (
                              <ImageUpload
                                value=""
                                onChange={(
                                  url
                                ) =>
                                  handleImageChange(
                                    index,
                                    url
                                  )
                                }
                              />
                            )}

                          </div>
                        );
                      }
                    )}

                  </div>
                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">

                  <button
                    type="button"
                    onClick={
                      handleDeleteProduct
                    }
                    disabled={
                      isUpdating
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />

                    Delete Product
                  </button>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={
                        handleCloseEdit
                      }
                      disabled={
                        isUpdating
                      }
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        isUpdating
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isUpdating && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}

                      {isUpdating
                        ? "Saving..."
                        : "Save Changes"}
                    </button>

                  </div>

                </div>

              </form>
            </div>
          </div>
        )}
    </div>
  );
}