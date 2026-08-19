"use client";

import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Clock, Truck } from "lucide-react";

const supabase = createClient();

interface MetricsData {
  totalCustomers: number;
  customerGrowth: number;
  totalOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  orderGrowth: number;
}

export const EcommerceMetrics = () => {
  const [metrics, setMetrics] = useState<MetricsData>({
    totalCustomers: 0,
    customerGrowth: 0,
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    orderGrowth: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      // 1. Fetch customer timestamps
      const { data: customerData, error: custErr } = await supabase
        .from("customers")
        .select("created_at");

      if (custErr) throw custErr;

      // 2. Fetch order timestamps and order statuses
      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .select("created_at, order_status");

      if (orderErr) throw orderErr;

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      // Timestamps for This Month vs Last Month
      const thisMonthStart = new Date(currentYear, currentMonth, 1);
      const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
      const lastMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

      // Customer Calculations & Month-over-Month Growth
      const totalCustCount = (customerData || []).length;
      let thisMonthCustCount = 0;
      let lastMonthCustCount = 0;

      (customerData || []).forEach((c) => {
        if (c.created_at) {
          const createdAt = new Date(c.created_at);
          if (createdAt >= thisMonthStart) {
            thisMonthCustCount++;
          } else if (createdAt >= lastMonthStart && createdAt <= lastMonthEnd) {
            lastMonthCustCount++;
          }
        }
      });

      let custGrowthRate = 0;
      if (lastMonthCustCount > 0) {
        custGrowthRate = Number(
          (((thisMonthCustCount - lastMonthCustCount) / lastMonthCustCount) * 100).toFixed(2)
        );
      } else if (thisMonthCustCount > 0) {
        custGrowthRate = 100;
      }

      // Order Calculations (Total, Pending, Shipped, Growth)
      const totalOrderCount = (orderData || []).length;
      let pendingCount = 0;
      let shippedCount = 0;
      let thisMonthOrderCount = 0;
      let lastMonthOrderCount = 0;

      (orderData || []).forEach((o) => {
        const status = o.order_status?.toLowerCase();

        // Pending = processing or packed
        if (status === "processing" || status === "packed") {
          pendingCount++;
        }
        // Shipped = shipped or delivered
        else if (status === "shipped" || status === "delivered") {
          shippedCount++;
        }

        if (o.created_at) {
          const createdAt = new Date(o.created_at);
          if (createdAt >= thisMonthStart) {
            thisMonthOrderCount++;
          } else if (createdAt >= lastMonthStart && createdAt <= lastMonthEnd) {
            lastMonthOrderCount++;
          }
        }
      });

      let orderGrowthRate = 0;
      if (lastMonthOrderCount > 0) {
        orderGrowthRate = Number(
          (((thisMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount) * 100).toFixed(2)
        );
      } else if (thisMonthOrderCount > 0) {
        orderGrowthRate = 100;
      }

      setMetrics({
        totalCustomers: totalCustCount,
        customerGrowth: custGrowthRate,
        totalOrders: totalOrderCount,
        pendingOrders: pendingCount,
        shippedOrders: shippedCount,
        orderGrowth: orderGrowthRate,
      });
    } catch (error: any) {
      console.error("Error loading dynamic ecommerce metrics:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Customers Metric Item --> */}
      <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
            </div>

            {!loading && (
              <Badge color={metrics.customerGrowth >= 0 ? "success" : "error"}>
                {metrics.customerGrowth >= 0 ? (
                  <ArrowUpIcon />
                ) : (
                  <ArrowDownIcon className="text-error-500" />
                )}
                {Math.abs(metrics.customerGrowth)}%
              </Badge>
            )}
          </div>

          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Customers
            </span>
            <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              ) : (
                metrics.totalCustomers.toLocaleString()
              )}
            </h4>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 dark:border-gray-800">
          Active Client Directory
        </div>
      </div>

      {/* <!-- Orders Metric Item with Total, Pending, and Shipped Breakdown --> */}
      <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <BoxIconLine className="text-gray-800 dark:text-white/90" />
            </div>

            {!loading && (
              <Badge color={metrics.orderGrowth >= 0 ? "success" : "error"}>
                {metrics.orderGrowth >= 0 ? (
                  <ArrowUpIcon />
                ) : (
                  <ArrowDownIcon className="text-error-500" />
                )}
                {Math.abs(metrics.orderGrowth)}%
              </Badge>
            )}
          </div>

          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Orders
            </span>
            <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              ) : (
                metrics.totalOrders.toLocaleString()
              )}
            </h4>
          </div>
        </div>

        {/* Breakdown: Pending & Shipped Status Badges */}
        <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Pending:</span>
            <span>{loading ? "..." : metrics.pendingOrders}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
            <Truck className="h-3.5 w-3.5" />
            <span>Shipped:</span>
            <span>{loading ? "..." : metrics.shippedOrders}</span>
          </div>
        </div>
      </div>
    </div>
  );
};