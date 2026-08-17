"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";

import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { getProducts } from "@/functions/products";

export default function ProductsTable() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Toggle single row selection
  const handleSelectRow = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Toggle select all rows
  const handleSelectAll = () => {
    if (selectedItems.length === products.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(products.map((item) => item.id));
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="My Products" />

      {/* Main Container Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        
        {/* Header Actions & Search Bar */}
        <div className="p-5 border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                Products List
              </h3>
              <p className="text-md text-gray-500 dark:text-gray-400">
                Track your store&apos;s progress to boost your sales.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-md font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              <a href="/add-product" className="flex items-center gap-2 px-4 py-2 text-md font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                <span className="text-base font-bold">+</span> Add Product
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 pl-9 pr-4 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>

            {/* Filter Button */}
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
          </div>
        </div>

        {/* Table Area */}
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.01]">
                <TableRow>
                  <TableCell isHeader className="w-10 px-5 py-3">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedItems.length === products.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                    />
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Products
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Category
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Brand
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Price
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Stock Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Created At
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell className="px-5 py-8 text-center text-xs text-gray-500">
                      Loading inventory...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-8 text-center text-xs text-gray-500">
                      No products found. Click &quot;Add Product&quot; to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                      <TableCell className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(product.id)}
                          onChange={() => handleSelectRow(product.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                        />
                      </TableCell>

                      {/* Product Image & Name */}
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center relative">
                            {product.image_url ? (
                              <Image
                                width={40}
                                height={40}
                                src={product.image_url}
                                alt={product.name || "Product Image"}
                                className="object-contain w-full h-full p-1"
                              />
                            ) : (
                              <span className="text-[10px] text-gray-400">No Img</span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800 text-xs block dark:text-white/90">
                              {product.name}
                            </span>
                            {product.custom_product_id && (
                              <span className="text-[10px] text-gray-400 block">
                                SKU: {product.custom_product_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-gray-500 text-start text-xs dark:text-gray-400">
                        {product.category || "—"}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-gray-500 text-start text-xs dark:text-gray-400">
                        {product.brand || "—"}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-gray-800 font-medium text-start text-xs dark:text-gray-200">
                        ${Number(product.price || 0).toFixed(2)}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={product.availability_status === "In Stock" ? "success" : "error"}
                        >
                          {product.availability_status || "Out of Stock"}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-gray-500 text-start text-xs dark:text-gray-400">
                        {product.created_at
                          ? new Date(product.created_at).toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-white/[0.05] text-xs text-gray-500">
          <div>
            Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{products.length}</span> entries
          </div>
        </div>

      </div>
    </div>
  );
}