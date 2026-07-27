"use client";

import React, { useState } from "react";
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

interface Product {
  id: number;
  name: string;
  image: string;
  category: string;
  brand: string;
  price: string;
  stockStatus: "In Stock" | "Out of Stock";
  createdAt: string;
}

const productsData: Product[] = [
  {
    id: 1,
    name: "ASUS ROG Gaming Laptop",
    image: "/images/product/asus-rog.png",
    category: "Laptop",
    brand: "ASUS",
    price: "$2,199",
    stockStatus: "Out of Stock",
    createdAt: "01 Dec, 2027",
  },
  {
    id: 2,
    name: "Airpods Pro 2nd Gen",
    image: "/images/product/airpods.png",
    category: "Accessories",
    brand: "Apple",
    price: "$839",
    stockStatus: "In Stock",
    createdAt: "29 Jun, 2027",
  },
  {
    id: 3,
    name: "Apple Watch Ultra",
    image: "/images/product/apple-watch.png",
    category: "Watch",
    brand: "Apple",
    price: "$1,579",
    stockStatus: "Out of Stock",
    createdAt: "13 Mar, 2027",
  },
  {
    id: 4,
    name: "Bose QuietComfort Earbuds",
    image: "/images/product/bose.png",
    category: "Audio",
    brand: "Bose",
    price: "$279",
    stockStatus: "In Stock",
    createdAt: "18 Nov, 2027",
  },
  {
    id: 5,
    name: "Canon EOS R5 Camera",
    image: "/images/product/canon.png",
    category: "Camera",
    brand: "Canon",
    price: "$3,899",
    stockStatus: "In Stock",
    createdAt: "28 Sep, 2027",
  },
  {
    id: 6,
    name: "Dell XPS 13 Laptop",
    image: "/images/product/dell.png",
    category: "Laptop",
    brand: "Dell",
    price: "$1,299",
    stockStatus: "In Stock",
    createdAt: "18 Aug, 2027",
  },
  {
    id: 7,
    name: "Google Pixel 8 Pro",
    image: "/images/product/pixel.png",
    category: "Phone",
    brand: "Google",
    price: "$899",
    stockStatus: "Out of Stock",
    createdAt: "02 Sep, 2027",
  },
];

export default function ProductsTable() {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

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
    if (selectedItems.length === productsData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(productsData.map((item) => item.id));
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
                      checked={selectedItems.length === productsData.length}
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
                    Stock
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Created At
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {productsData.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <TableCell className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(product.id)}
                        onChange={() => handleSelectRow(product.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                      />
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center">
                          <Image
                            width={40}
                            height={40}
                            src={product.image}
                            alt={product.name}
                            className="object-contain w-full h-full p-1"
                          />
                        </div>
                        <span className="font-semibold text-gray-800 text-xs dark:text-white/90">
                          {product.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-start text-xs dark:text-gray-400">
                      {product.category}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-start text-xs dark:text-gray-400">
                      {product.brand}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 font-medium text-start text-xs dark:text-gray-200">
                      {product.price}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <Badge
                        size="sm"
                        color={product.stockStatus === "In Stock" ? "success" : "error"}
                      >
                        {product.stockStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-start text-xs dark:text-gray-400">
                      {product.createdAt}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-white/[0.05] text-xs text-gray-500">
          <div>
            Showing <span className="font-semibold text-gray-700 dark:text-gray-300">1 to 7</span> of <span className="font-semibold text-gray-700 dark:text-gray-300">20</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 disabled:opacity-50 dark:border-gray-700">
              &larr;
            </button>
            <button className="px-3 py-1.5 bg-blue-600 text-white font-medium rounded-lg">
              1
            </button>
            <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-800">
              2
            </button>
            <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-800">
              3
            </button>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 dark:border-gray-700 dark:text-gray-300">
              &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}