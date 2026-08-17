"use client";

import React, { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  Calendar,
  ReceiptText,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Phone,
  Mail,
  X,
  Check,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

interface InvoiceRecord {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  grand_total: number;
  paid_amount: number;
  remaining_balance: number;
  payment_status: "Paid" | "Partial" | "Unpaid";
  created_at: string;
}

interface MonthSummary {
  monthKey: string; // e.g., "January", "February"
  year: number;
  monthIndex: number; // 0 to 11
  totalRevenue: number;
  invoiceCount: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  outstandingBalance: number;
  growthRate: number;
  invoices: InvoiceRecord[];
}

export default function MonthlySalesCardsPage() {
  const currentYear = new Date().getFullYear();
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthSummary[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
  ]);

  // Modal State
  const [selectedMonthModal, setSelectedMonthModal] = useState<MonthSummary | null>(null);
  const [settlingInvoiceId, setSettlingInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableYears();
  }, []);

  useEffect(() => {
    fetchMonthlySummaries();
  }, [selectedYear]);

  const fetchAvailableYears = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("created_at");

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
      console.error("Error fetching distinct invoice years:", err.message);
    }
  };

  const fetchMonthlySummaries = async () => {
    try {
      setLoading(true);

      const startOfYear = `${selectedYear}-01-01T00:00:00`;
      const endOfYear = `${selectedYear}-12-31T23:59:59.999`;

      const { data: invoices, error } = await supabase
        .from("invoices")
        .select("*")
        .gte("created_at", startOfYear)
        .lte("created_at", endOfYear)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const monthBuckets: MonthSummary[] = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(selectedYear, i, 1);
        return {
          monthKey: d.toLocaleString("default", { month: "long" }),
          year: selectedYear,
          monthIndex: i,
          totalRevenue: 0,
          invoiceCount: 0,
          paidCount: 0,
          partialCount: 0,
          unpaidCount: 0,
          outstandingBalance: 0,
          growthRate: 0,
          invoices: [],
        };
      });

      (invoices || []).forEach((inv: any) => {
        const invDate = new Date(inv.created_at);
        const mIndex = invDate.getMonth();

        monthBuckets[mIndex].totalRevenue += Number(inv.grand_total) || 0;
        monthBuckets[mIndex].invoiceCount += 1;
        monthBuckets[mIndex].outstandingBalance += Number(inv.remaining_balance) || 0;
        monthBuckets[mIndex].invoices.push(inv);

        if (inv.payment_status === "Paid") {
          monthBuckets[mIndex].paidCount += 1;
        } else if (inv.payment_status === "Partial") {
          monthBuckets[mIndex].partialCount += 1;
        } else {
          monthBuckets[mIndex].unpaidCount += 1;
        }
      });

      for (let i = 0; i < 12; i++) {
        if (i > 0) {
          const prev = monthBuckets[i - 1].totalRevenue;
          const curr = monthBuckets[i].totalRevenue;
          if (prev > 0) {
            monthBuckets[i].growthRate = Number((((curr - prev) / prev) * 100).toFixed(1));
          } else if (curr > 0) {
            monthBuckets[i].growthRate = 100;
          }
        }
      }

      setMonthlyData(monthBuckets);
    } catch (err: any) {
      console.error("Error fetching monthly data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mark full payment collected directly inside the modal
  const handleMarkAsSettled = async (invoice: InvoiceRecord) => {
    try {
      setSettlingInvoiceId(invoice.id);
      const { error } = await supabase
        .from("invoices")
        .update({
          payment_status: "Paid",
          paid_amount: invoice.grand_total,
          remaining_balance: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoice.id);

      if (error) throw error;

      // Update local modal data & refresh cards
      if (selectedMonthModal) {
        const updatedInvoices = selectedMonthModal.invoices.map((inv) =>
          inv.id === invoice.id
            ? { ...inv, payment_status: "Paid" as const, paid_amount: inv.grand_total, remaining_balance: 0 }
            : inv
        );
        setSelectedMonthModal({
          ...selectedMonthModal,
          invoices: updatedInvoices,
          outstandingBalance: Math.max(0, selectedMonthModal.outstandingBalance - invoice.remaining_balance),
        });
      }
      fetchMonthlySummaries();
    } catch (err: any) {
      alert("Error marking invoice as settled: " + err.message);
    } finally {
      setSettlingInvoiceId(null);
    }
  };

  const yearlyTotal = useMemo(
    () => monthlyData.reduce((sum, m) => sum + m.totalRevenue, 0),
    [monthlyData]
  );
  const yearlyInvoices = useMemo(
    () => monthlyData.reduce((sum, m) => sum + m.invoiceCount, 0),
    [monthlyData]
  );
  const yearlyOutstanding = useMemo(
    () => monthlyData.reduce((sum, m) => sum + m.outstandingBalance, 0),
    [monthlyData]
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Dynamic Year Selector */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Monthly Performance Breakdown
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Click any month card to view and manage pending collections for {selectedYear}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Year:
          </label>
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

      {/* Annual Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Total {selectedYear} Revenue
          </span>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            ${yearlyTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Total Invoices Issued
          </span>
          <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {yearlyInvoices}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Total Uncollected Due
          </span>
          <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
            ${yearlyOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Monthly Cards Grid (Clickable) */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
          Loading monthly figures...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {monthlyData.map((month) => {
            const hasUnpaid = month.partialCount + month.unpaidCount > 0;

            return (
              <div
                key={month.monthIndex}
                onClick={() => setSelectedMonthModal(month)}
                className={`cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-lg dark:bg-gray-900 ${
                  month.totalRevenue > 0
                    ? "border-gray-200 dark:border-gray-800"
                    : "border-dashed border-gray-200 opacity-60 dark:border-gray-800"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/30">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {month.monthKey}
                    </h3>
                  </div>

                  {month.totalRevenue > 0 && month.monthIndex > 0 && (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        month.growthRate >= 0
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                          : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                      }`}
                    >
                      {month.growthRate >= 0 ? (
                        <ArrowUpRight className="mr-0.5 h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="mr-0.5 h-3 w-3" />
                      )}
                      {month.growthRate}%
                    </span>
                  )}
                </div>

                {/* Revenue */}
                <div className="mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Gross Sales</p>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${month.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Breakdown Details */}
                <div className="mt-4 space-y-2 rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800/50">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <ReceiptText className="h-3.5 w-3.5 text-gray-400" /> Total Invoices
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {month.invoiceCount}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Settled
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {month.paidCount}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Partial / Due
                    </span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {month.partialCount + month.unpaidCount}
                    </span>
                  </div>

                  {hasUnpaid && (
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-red-50 p-2 text-xs font-semibold text-red-700 dark:bg-red-900/20 dark:text-red-400">
                      <span>Uncollected:</span>
                      <span>${month.outstandingBalance.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unpaid Bills Modal */}
      {selectedMonthModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedMonthModal.monthKey} {selectedMonthModal.year} — Pending Collections
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total Outstanding Balance:{" "}
                  <strong className="text-red-600 dark:text-red-400">
                    ${selectedMonthModal.outstandingBalance.toFixed(2)}
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

            {/* Invoices List */}
            <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {selectedMonthModal.invoices.filter((inv) => inv.payment_status !== "Paid").length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  <h4 className="mt-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    All Bills Fully Settled!
                  </h4>
                  <p className="text-xs text-gray-400">
                    No pending customer dues or partial payments for this month.
                  </p>
                </div>
              ) : (
                selectedMonthModal.invoices
                  .filter((inv) => inv.payment_status !== "Paid")
                  .map((inv) => (
                    <div
                      key={inv.id}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition dark:border-gray-800 dark:bg-gray-800/40 sm:flex-row sm:items-center"
                    >
                      {/* Customer Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {inv.invoice_number}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              inv.payment_status === "Partial"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {inv.payment_status}
                          </span>
                        </div>
                        <h4 className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                          {inv.customer_name}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          {inv.customer_phone ? (
                            <a
                              href={`tel:${inv.customer_phone}`}
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                            >
                              <Phone className="h-3 w-3" />
                              {inv.customer_phone}
                            </a>
                          ) : (
                            <span>No phone</span>
                          )}

                          {inv.customer_email && (
                            <a
                              href={`mailto:${inv.customer_email}?subject=Invoice Reminder ${inv.invoice_number}`}
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                            >
                              <Mail className="h-3 w-3" />
                              {inv.customer_email}
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Balances & Settlement Action */}
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <div className="text-right">
                          <div className="text-xs text-gray-400">
                            Total: ${Number(inv.grand_total).toFixed(2)}
                          </div>
                          <div className="text-sm font-bold text-red-600 dark:text-red-400">
                            Due: ${Number(inv.remaining_balance).toFixed(2)}
                          </div>
                        </div>

                        <button
                          onClick={() => handleMarkAsSettled(inv)}
                          disabled={settlingInvoiceId === inv.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {settlingInvoiceId === inv.id ? "Settling..." : "Mark Paid"}
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Modal Footer */}
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