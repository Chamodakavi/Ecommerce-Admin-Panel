"use client";

import React, { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  Calendar,
  ReceiptText,
  TrendingUp,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { isCurrentUserOwner } from "@/functions/auth";

const supabase = createClient();

interface InvoiceItem {
  product_id?: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceRecord {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  created_at: string;
  items: InvoiceItem[];
  grand_total: number;
}

interface Product {
  id: string;
  name: string;
  cost_price: number | null;
}

interface MonthProfitSummary {
  monthKey: string;
  year: number;
  monthIndex: number;
  totalNetProfit: number;
  productRevenue: number;
  productCost: number;
  invoiceCount: number;
  invoices: InvoiceRecord[];
}

export default function ProductNetProfitPage() {
  const currentYear = new Date().getFullYear();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonthProfitSummary[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
  ]);
  const [isOwner, setIsOwner] = useState(false);

  // Modal State
  const [selectedMonthModal, setSelectedMonthModal] = useState<MonthProfitSummary | null>(null);

  useEffect(() => {
    setIsOwner(isCurrentUserOwner());
  }, []);

  useEffect(() => {
    if (isOwner) {
      fetchAvailableYears();
    }
  }, [isOwner]);

  useEffect(() => {
    if (isOwner) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [selectedYear, isOwner]);

  const fetchAvailableYears = async () => {
    try {
      const { data, error } = await supabase.from("invoices").select("created_at");
      if (error) throw error;

      const yearSet = new Set<number>([currentYear]);
      (data || []).forEach((row) => {
        if (row.created_at) {
          const y = new Date(row.created_at).getFullYear();
          if (!isNaN(y)) yearSet.add(y);
        }
      });

      setAvailableYears(Array.from(yearSet).sort((a, b) => b - a));
    } catch (err: any) {
      console.error("Error fetching years:", err.message);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const startOfYear = `${selectedYear}-01-01T00:00:00`;
      const endOfYear = `${selectedYear}-12-31T23:59:59.999`;

      const [{ data: invoices, error: invErr }, { data: products, error: prodErr }] = await Promise.all([
        supabase
          .from("invoices")
          .select("id, invoice_number, customer_name, customer_phone, customer_email, created_at, items, grand_total")
          .gte("created_at", startOfYear)
          .lte("created_at", endOfYear)
          .order("created_at", { ascending: true }),
        supabase.from("products").select("id, name, cost_price"),
      ]);

      if (invErr) throw invErr;
      if (prodErr) throw prodErr;

      const productMap = new Map((products || []).map((p) => [p.id, p]));

      const monthBuckets: MonthProfitSummary[] = Array.from({ length: 12 }, (_, i) => ({
        monthKey: new Date(selectedYear, i, 1).toLocaleString("default", { month: "long" }),
        year: selectedYear,
        monthIndex: i,
        totalNetProfit: 0,
        productRevenue: 0,
        productCost: 0,
        invoiceCount: 0,
        invoices: [],
      }));

      (invoices || []).forEach((inv: any) => {
        const invDate = new Date(inv.created_at);
        const mIndex = invDate.getMonth();

        let monthProfit = 0;
        let monthRev = 0;
        let monthCost = 0;
        const items = Array.isArray(inv.items) ? inv.items : [];

        items.forEach((item: InvoiceItem) => {
          if (item.product_id) {
            const product = productMap.get(item.product_id);
            if (product && product.cost_price !== null) {
              const qty = Number(item.quantity) || 0;
              const sellPrice = Number(item.unitPrice) || 0;
              const costPrice = Number(product.cost_price) || 0;

              const itemRev = sellPrice * qty;
              const itemCost = costPrice * qty;
              const itemProfit = (sellPrice - costPrice) * qty;

              monthRev += itemRev;
              monthCost += itemCost;
              monthProfit += itemProfit;
            }
          }
        });

        monthBuckets[mIndex].totalNetProfit += monthProfit;
        monthBuckets[mIndex].productRevenue += monthRev;
        monthBuckets[mIndex].productCost += monthCost;
        monthBuckets[mIndex].invoiceCount += 1;
        monthBuckets[mIndex].invoices.push(inv);
      });

      setData(monthBuckets);
    } catch (err: any) {
      console.error("Error fetching product net profit:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const yearlyNetProfit = useMemo(() => data.reduce((sum, m) => sum + m.totalNetProfit, 0), [data]);
  const yearlyProductRevenue = useMemo(() => data.reduce((sum, m) => sum + m.productRevenue, 0), [data]);
  const yearlyProductCost = useMemo(() => data.reduce((sum, m) => sum + m.productCost, 0), [data]);

  if (!isOwner) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
        <div>
          <h3 className="text-lg font-bold">Access Denied</h3>
          <p className="mt-1 text-sm">This page is restricted exclusively to store owners.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Product Net Profit Analytics" />

      {/* Header & Year Selector */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Monthly Product Net Profit
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Excludes services and charges. Shows exact selling price minus bought price for each product item.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Annual Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Product Net Profit ({selectedYear})</span>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${yearlyNetProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Product Revenue</span>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            ${yearlyProductRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Product Cost Price</span>
          <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
            ${yearlyProductCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Monthly Cards Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
          Loading product net profit analytics...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((month) => (
            <div
              key={month.monthIndex}
              onClick={() => setSelectedMonthModal(month)}
              className={`cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-lg dark:bg-gray-900 ${
                month.productRevenue > 0
                  ? "border-gray-200 dark:border-gray-800"
                  : "border-dashed border-gray-200 opacity-60 dark:border-gray-800"
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/30">
                    <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">{month.monthKey}</h3>
                </div>
                <span className="text-xs font-semibold text-gray-400">{month.invoiceCount} invoices</span>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">Product Net Profit</p>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${month.totalNetProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="mt-4 space-y-1.5 rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800/50">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Product Sales:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${month.productRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Product Cost:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">${month.productCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Month Details Modal */}
      {selectedMonthModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedMonthModal.monthKey} {selectedMonthModal.year} — Product Net Profit Breakdown
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total Month Net Profit:{" "}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    ${selectedMonthModal.totalNetProfit.toFixed(2)}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedMonthModal(null)}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {selectedMonthModal.invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ReceiptText className="h-10 w-10 text-gray-400" />
                  <h4 className="mt-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    No Invoices Recorded
                  </h4>
                </div>
              ) : (
                selectedMonthModal.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition dark:border-gray-800 dark:bg-gray-800/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {inv.invoice_number}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {inv.customer_name}
                      </h4>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Total: ${Number(inv.grand_total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 flex justify-end border-t border-gray-100 pt-4 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setSelectedMonthModal(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
