"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import {
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Car,
  Loader2,
  Calendar,
  Clock,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Dynamically import ReactApexChart to prevent SSR hydration mismatches
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const supabase = createClient();

type ViewMode = "monthly" | "daily";

export default function MonthlySales() {
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");

  // Metrics Data
  const [currentTotal, setCurrentTotal] = useState<number>(0);
  const [previousTotal, setPreviousTotal] = useState<number>(0);
  const [invoiceCount, setInvoiceCount] = useState<number>(0);
  const [percentageGrowth, setPercentageGrowth] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchSalesData();
  }, [viewMode]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      let startCurrent: string;
      let endCurrent: string;
      let startPrevious: string;
      let endPrevious: string;

      if (viewMode === "monthly") {
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        startCurrent = new Date(currentYear, currentMonth, 1).toISOString();
        endCurrent = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();

        startPrevious = new Date(currentYear, currentMonth - 1, 1).toISOString();
        endPrevious = new Date(currentYear, currentMonth, 0, 23, 59, 59).toISOString();
      } else {
        // Daily: Today vs Yesterday
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
        const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);

        startCurrent = todayStart.toISOString();
        endCurrent = todayEnd.toISOString();
        startPrevious = yesterdayStart.toISOString();
        endPrevious = yesterdayEnd.toISOString();
      }

      // Fetch from Supabase
      const { data: currentInvoices, error: currentErr } = await supabase
        .from("invoices")
        .select("grand_total, created_at")
        .gte("created_at", startCurrent)
        .lte("created_at", endCurrent);

      const { data: previousInvoices, error: prevErr } = await supabase
        .from("invoices")
        .select("grand_total, created_at")
        .gte("created_at", startPrevious)
        .lte("created_at", endPrevious);

      if (currentErr) throw currentErr;
      if (prevErr) throw prevErr;

      const currentRev = (currentInvoices || []).reduce(
        (sum, item) => sum + (Number(item.grand_total) || 0),
        0
      );

      const prevRev = (previousInvoices || []).reduce(
        (sum, item) => sum + (Number(item.grand_total) || 0),
        0
      );

      // Percentage calculation
      let growth = 0;
      if (prevRev > 0) {
        growth = Number((((currentRev - prevRev) / prevRev) * 100).toFixed(1));
      } else if (currentRev > 0) {
        growth = 100;
      }

      setCurrentTotal(currentRev);
      setPreviousTotal(prevRev);
      setInvoiceCount(currentInvoices?.length || 0);
      setPercentageGrowth(growth);
    } catch (err: any) {
      console.error("Error loading sales metrics:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Radial chart percentage configuration
  const chartValue = Math.min(100, Math.max(0, percentageGrowth > 0 ? percentageGrowth : 50));
  const series = [chartValue];

  const options: ApexOptions = {
    colors: ["#3B82F6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 300,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "75%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "28px",
            fontWeight: "700",
            offsetY: -35,
            color: "#1D2939",
            formatter: function () {
              return currentTotal >= 1000
                ? `$${(currentTotal / 1000).toFixed(1)}K`
                : `$${currentTotal.toFixed(0)}`;
            },
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: ["#2563EB"],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: "round",
    },
    labels: [viewMode === "monthly" ? "Monthly Total" : "Today's Total"],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="rounded-2xl bg-white px-5 pb-8 pt-5 shadow-default dark:bg-gray-900 sm:px-6 sm:pt-6">
        
        {/* Header & Toggle Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {viewMode === "monthly" ? "Monthly Sales" : "Daily Sales"} Performance
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {viewMode === "monthly"
                ? "Total invoiced revenue for this month"
                : "Real-time earnings generated today"}
            </p>
          </div>

          {/* Toggle Button & Dropdown */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <button
                onClick={() => setViewMode("daily")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
                  viewMode === "daily"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <Clock className="h-3 w-3" />
                Daily
              </button>
              <button
                onClick={() => setViewMode("monthly")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
                  viewMode === "monthly"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <Calendar className="h-3 w-3" />
                Monthly
              </button>
            </div>

            <div className="relative inline-block">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              <Dropdown
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                className="w-40 p-2"
              >
                <DropdownItem
                  tag="a"
                  onItemClick={() => {
                    setIsOpen(false);
                    fetchSalesData();
                  }}
                  className="flex w-full rounded-lg text-left text-xs font-normal text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                >
                  Refresh Data
                </DropdownItem>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Apex Chart & Growth Badge */}
        {loading ? (
          <div className="flex h-[260px] items-center justify-center text-xs text-gray-400">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
            Loading actual {viewMode} figures...
          </div>
        ) : (
          <>
            <div className="relative mt-2">
              <div className="max-h-[300px]">
                <ReactApexChart
                  options={options}
                  series={series}
                  type="radialBar"
                  height={300}
                />
              </div>

              <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[110%]">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    percentageGrowth >= 0
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                      : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                  }`}
                >
                  {percentageGrowth >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {percentageGrowth >= 0 ? `+${percentageGrowth}%` : `${percentageGrowth}%`} vs{" "}
                  {viewMode === "monthly" ? "Last Month" : "Yesterday"}
                </span>
              </div>
            </div>

            {/* Summary Text */}
            <p className="mx-auto mt-6 max-w-[340px] text-center text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
              Total {viewMode === "monthly" ? "month" : "day"} earnings:{" "}
              <strong className="text-gray-800 dark:text-white">
                ${currentTotal.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </p>
          </>
        )}
      </div>

      {/* Footer Comparison Cards */}
      <div className="flex items-center justify-around px-4 py-4 sm:px-6">
        {/* Current Period */}
        <div className="text-center">
          <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
            {viewMode === "monthly" ? "This Month" : "Today"}
          </p>
          <p className="flex items-center justify-center gap-1 text-sm font-bold text-gray-800 dark:text-white sm:text-base">
            {currentTotal >= 1000
              ? `$${(currentTotal / 1000).toFixed(1)}K`
              : `$${currentTotal.toFixed(0)}`}
          </p>
        </div>

        <div className="h-7 w-px bg-gray-200 dark:bg-gray-800"></div>

        {/* Previous Period */}
        <div className="text-center">
          <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
            {viewMode === "monthly" ? "Last Month" : "Yesterday"}
          </p>
          <p className="flex items-center justify-center gap-1 text-sm font-bold text-gray-800 dark:text-white sm:text-base">
            {previousTotal >= 1000
              ? `$${(previousTotal / 1000).toFixed(1)}K`
              : `$${previousTotal.toFixed(0)}`}
          </p>
        </div>

        <div className="h-7 w-px bg-gray-200 dark:bg-gray-800"></div>

        {/* Invoice Units */}
        <div className="text-center">
          <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
            Invoices
          </p>
          <p className="flex items-center justify-center gap-1 text-sm font-bold text-gray-800 dark:text-white sm:text-base">
            {invoiceCount}
            <Car className="h-3.5 w-3.5 text-indigo-500" />
          </p>
        </div>
      </div>
    </div>
  );
}