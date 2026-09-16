"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

// Structure of each line item inside the items JSONB column
interface OrderLineItem {
  id?: string | number;
  product_name?: string;
  name?: string;
  image?: string;
  image_url?: string;
  quantity?: number;
  price?: number;
}

// Interface matching the public.orders schema
export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  items: OrderLineItem[];
  total_amount: number;
  payment_method?: string;
  payment_status?: string;
  order_status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | string;
  created_at: string;
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const supabase = createClient();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("orders")
        .select(
          "id, order_number, customer_name, customer_email, items, total_amount, payment_method, payment_status, order_status, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(5);

      if (statusFilter !== "All") {
        query = query.eq("order_status", statusFilter.toLowerCase());
      }

      const { data, error } = await query;
      if (error) throw error;

      setOrders(data || []);
    } catch (err: any) {
      console.error("Failed to fetch recent orders:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const toggleFilter = () => {
    const sequence = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];
    const currentIndex = sequence.indexOf(statusFilter);
    const nextIndex = (currentIndex + 1) % sequence.length;
    setStatusFilter(sequence[nextIndex]);
  };

  const getBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "success";
      case "shipped":
        return "info";
      case "processing":
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "light";
    }
  };

  const formatCurrency = (val: number) => {
    return `LKR ${Number(val || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleFilter}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Filter: {statusFilter}
          </button>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            See all
          </Link>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Order / Items
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Customer
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Total Amount
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell className="py-8 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    Loading recent orders...
                  </div>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                // Parse the first item thumbnail & title from items jsonb
                const firstItem = Array.isArray(order.items) && order.items.length > 0 ? order.items[0] : null;
                const extraItemsCount = Array.isArray(order.items) ? order.items.length - 1 : 0;
                const displayTitle = firstItem?.product_name || firstItem?.name || "Order Item";
                const displayImage = firstItem?.image_url || firstItem?.image || "/images/product/product-01.jpg";

                return (
                  <TableRow key={order.id}>
                    {/* Item & Order ID */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-[48px] w-[48px] shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                          <Image
                            fill
                            src={displayImage}
                            className="object-cover"
                            alt={displayTitle}
                          />
                        </div>
                        <div>
                          <p className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
                            #{order.order_number}
                          </p>
                          <span className="truncate text-theme-xs text-gray-500 dark:text-gray-400">
                            {displayTitle}
                            {extraItemsCount > 0 && ` +${extraItemsCount} more`}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Customer Info */}
                    <TableCell className="py-3">
                      <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {order.customer_name}
                      </p>
                      <span className="text-theme-xs text-gray-400">
                        {order.payment_method || "COD"}
                      </span>
                    </TableCell>

                    {/* Total Amount */}
                    <TableCell className="py-3 text-theme-sm font-semibold text-gray-800 dark:text-gray-200">
                      {formatCurrency(order.total_amount)}
                    </TableCell>

                    {/* Order Status Badge */}
                    <TableCell className="py-3 text-theme-sm">
                      <Badge
                        size="sm"
                        color={getBadgeColor(order.order_status)}
                      >
                        <span className="capitalize">{order.order_status}</span>
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}