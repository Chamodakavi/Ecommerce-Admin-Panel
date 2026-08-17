"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  DollarSign,
  ReceiptText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const supabase = createClient();

export default function DailySalesPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [yesterdayRevenue, setYesterdayRevenue] = useState(0);
  const [todayInvoices, setTodayInvoices] = useState<any[]>([]);
  const [paidCount, setPaidCount] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [partialCount, setPartialCount] = useState(0);
  const [hourlyData, setHourlyData] = useState<number[]>(new Array(12).fill(0));

  useEffect(() => {
    fetchDailyAnalytics();
  }, [selectedDate]);

  const fetchDailyAnalytics = async () => {
    try {
      setLoading(true);
      const [year, month, day] = selectedDate.split("-").map(Number);
      const currentSelected = new Date(year, month - 1, day);

      const startToday = new Date(year, month - 1, day, 0, 0, 0).toISOString();
      const endToday = new Date(year, month - 1, day, 23, 59, 59).toISOString();

      const prevDate = new Date(currentSelected);
      prevDate.setDate(prevDate.getDate() - 1);
      const startYesterday = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth(),
        prevDate.getDate(),
        0,
        0,
        0
      ).toISOString();
      const endYesterday = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth(),
        prevDate.getDate(),
        23,
        59,
        59
      ).toISOString();

      // Query selected day's and previous day's records
      const { data: todayRecords, error: todayErr } = await supabase
        .from("invoices")
        .select("*")
        .gte("created_at", startToday)
        .lte("created_at", endToday)
        .order("created_at", { ascending: false });

      const { data: yesterdayRecords, error: yestErr } = await supabase
        .from("invoices")
        .select("grand_total")
        .gte("created_at", startYesterday)
        .lte("created_at", endYesterday);

      if (todayErr) throw todayErr;
      if (yestErr) throw yestErr;

      const totalToday = (todayRecords || []).reduce(
        (sum, inv) => sum + (Number(inv.grand_total) || 0),
        0
      );
      const totalYesterday = (yesterdayRecords || []).reduce(
        (sum, inv) => sum + (Number(inv.grand_total) || 0),
        0
      );

      setTodayRevenue(totalToday);
      setYesterdayRevenue(totalYesterday);
      setTodayInvoices(todayRecords || []);

      // Calculate status breakdown
      let paid = 0,
        unpaid = 0,
        partial = 0;
      const hours = new Array(12).fill(0);

      (todayRecords || []).forEach((inv) => {
        if (inv.payment_status === "Paid") paid++;
        else if (inv.payment_status === "Partial") partial++;
        else unpaid++;

        const hour = new Date(inv.created_at).getHours();
        if (hour >= 8 && hour < 20) {
          const bucketIndex = Math.floor((hour - 8) / 1);
          if (bucketIndex >= 0 && bucketIndex < 12) {
            hours[bucketIndex] += Number(inv.grand_total) || 0;
          }
        }
      });

      setPaidCount(paid);
      setUnpaidCount(unpaid);
      setPartialCount(partial);
      setHourlyData(hours);
    } catch (err: any) {
      console.error("Daily analytics fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const momGrowth =
    yesterdayRevenue > 0
      ? Number(
          (((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(
            1
          )
        )
      : todayRevenue > 0
      ? 100
      : 0;

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Daily Sales Analytics" />

      {/* Prominent Date Filter Banner */}
<div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
      Select Date to See your Earnings
    </h2>
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
      View detailed billing summary, revenue collection, and orders for any given day.
    </p>
  </div>

  {/* Full-Area Clickable Calendar Picker */}
  <div className="relative flex items-center min-w-[240px] rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm transition hover:border-blue-500 hover:bg-white dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 dark:hover:bg-gray-800">
    <CalendarIcon className="pointer-events-none mr-3 h-5 w-5 text-blue-600 dark:text-blue-400" />
    
    <span className="pointer-events-none text-sm font-semibold text-gray-800 dark:text-white">
      {selectedDate}
    </span>

    {/* Transparent Input Stretched Over Full Container */}
    <input
      type="date"
      value={selectedDate}
      onChange={(e) => {
        if (e.target.value) setSelectedDate(e.target.value);
      }}
      onClick={(e) => {
        if ("showPicker" in HTMLInputElement.prototype) {
          try {
            e.currentTarget.showPicker();
          } catch (err) {}
        }
      }}
      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
    />
  </div>
</div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Gross Earnings */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Selected Day&apos;s Revenue
            </span>
            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/30">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ${todayRevenue.toFixed(2)}
            </span>
            <span
              className={`inline-flex items-center text-xs font-semibold ${
                momGrowth >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {momGrowth >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {momGrowth}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">
            vs. ${yesterdayRevenue.toFixed(2)} previous day
          </p>
        </div>

        {/* Total Invoices Today */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Billed Orders
            </span>
            <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/30">
              <ReceiptText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            {todayInvoices.length}
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Invoices issued for date</p>
        </div>

        {/* Fully Paid Count */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Fully Settled
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {paidCount}
          </div>
          <p className="mt-1 text-[11px] text-gray-400">100% paid invoices</p>
        </div>

        {/* Pending / Unpaid */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Pending / Credit
            </span>
            <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-900/30">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {unpaidCount + partialCount}
          </div>
          <p className="mt-1 text-[11px] text-gray-400">
            {partialCount} partial, {unpaidCount} unpaid
          </p>
        </div>
      </div>

      {/* Today's Transactions Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 p-5 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">
            Billed Invoices ({selectedDate})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 uppercase text-gray-500 dark:bg-gray-800/50">
              <tr>
                <th className="px-5 py-3 font-semibold">Invoice No</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {todayInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No transactions recorded for this date.
                  </td>
                </tr>
              ) : (
                todayInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5 font-semibold text-blue-600 dark:text-blue-400">
                      {inv.invoice_number}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-gray-200">
                      {inv.customer_name}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white">
                      ${Number(inv.grand_total).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          inv.payment_status === "Paid"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : inv.payment_status === "Partial"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {inv.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400">
                      {new Date(inv.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}