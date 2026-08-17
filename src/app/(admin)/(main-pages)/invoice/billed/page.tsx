"use client";

import React, { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import { getInvoices, updateInvoice, deleteInvoice } from "@/functions/invoices";
import {
  generateInvoicePDF,
  InvoicePDFPayload,
  InvoiceItemData,
} from "@/functions/invoiceGenerator";

interface StoredInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  items: InvoiceItemData[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  grand_total: number;
  payment_status: "Paid" | "Unpaid" | "Partial";
  paid_amount: number;
  remaining_balance: number;
  created_at: string;
}

export default function BilledInvoicesPage() {
  const [invoices, setInvoices] = useState<StoredInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Modal State
  const [editingInvoice, setEditingInvoice] = useState<StoredInvoice | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await getInvoices();
      setInvoices(data || []);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load invoices from Supabase.");
    } finally {
      setLoading(false);
    }
  };

  // Search & Filter Logic
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.customer_email &&
          inv.customer_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (inv.customer_phone && inv.customer_phone.includes(searchQuery));

      const matchesStatus =
        selectedStatus === "All" || inv.payment_status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, selectedStatus]);

  // Open Edit Modal
  const handleRowClick = (inv: StoredInvoice) => {
    setEditingInvoice({
      ...inv,
      items: Array.isArray(inv.items) && inv.items.length > 0
        ? JSON.parse(JSON.stringify(inv.items))
        : [{ id: "1", name: "", quantity: 1, unitPrice: 0 }],
    });
  };

  // Modal Item Modifications
  const handleItemChange = (
    index: number,
    field: keyof InvoiceItemData,
    value: string | number
  ) => {
    if (!editingInvoice) return;
    const updatedItems = [...editingInvoice.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    recalculateTotals(
      updatedItems,
      editingInvoice.tax_rate,
      editingInvoice.discount,
      editingInvoice.payment_status,
      editingInvoice.paid_amount
    );
  };

  const handleAddItem = () => {
    if (!editingInvoice) return;
    const updatedItems = [
      ...editingInvoice.items,
      { id: Date.now().toString(), name: "", quantity: 1, unitPrice: 0 },
    ];
    recalculateTotals(
      updatedItems,
      editingInvoice.tax_rate,
      editingInvoice.discount,
      editingInvoice.payment_status,
      editingInvoice.paid_amount
    );
  };

  const handleRemoveItem = (index: number) => {
    if (!editingInvoice || editingInvoice.items.length <= 1) return;
    const updatedItems = editingInvoice.items.filter((_, i) => i !== index);
    recalculateTotals(
      updatedItems,
      editingInvoice.tax_rate,
      editingInvoice.discount,
      editingInvoice.payment_status,
      editingInvoice.paid_amount
    );
  };

  const recalculateTotals = (
    items: InvoiceItemData[],
    taxRate: number,
    discount: number,
    paymentStatus: "Paid" | "Unpaid" | "Partial",
    paidAmount: number
  ) => {
    const subtotal = items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );
    const taxAmount = (subtotal * (Number(taxRate) || 0)) / 100;
    const grandTotal = Math.max(0, subtotal + taxAmount - (Number(discount) || 0));
    const remainingBalance =
      paymentStatus === "Paid"
        ? 0
        : paymentStatus === "Unpaid"
        ? grandTotal
        : Math.max(0, grandTotal - (Number(paidAmount) || 0));

    setEditingInvoice((prev) =>
      prev
        ? {
            ...prev,
            items,
            subtotal,
            tax_rate: taxRate,
            tax_amount: taxAmount,
            discount,
            grand_total: grandTotal,
            payment_status: paymentStatus,
            paid_amount: paidAmount,
            remaining_balance: remainingBalance,
          }
        : null
    );
  };

  // Save Modal Changes to Supabase
  const handleSaveChanges = async () => {
    if (!editingInvoice) return;
    try {
      setIsSaving(true);
      const updated = await updateInvoice(editingInvoice.id, {
        invoiceNumber: editingInvoice.invoice_number,
        invoiceDate: editingInvoice.invoice_date,
        customerName: editingInvoice.customer_name,
        customerEmail: editingInvoice.customer_email || undefined,
        customerPhone: editingInvoice.customer_phone || undefined,
        items: editingInvoice.items,
        paymentStatus: editingInvoice.payment_status,
        paidAmount: Number(editingInvoice.paid_amount),
        taxRate: Number(editingInvoice.tax_rate),
        taxAmount: Number(editingInvoice.tax_amount),
        discount: Number(editingInvoice.discount),
        subtotal: Number(editingInvoice.subtotal),
        grandTotal: Number(editingInvoice.grand_total),
        remainingBalance: Number(editingInvoice.remaining_balance),
      });

      setInvoices((prev) =>
        prev.map((item) => (item.id === editingInvoice.id ? updated : item))
      );
      setEditingInvoice(null);
    } catch (err: any) {
      alert("Failed to update invoice: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Invoice Handler
  const handleDeleteInvoice = async () => {
    if (!editingInvoice) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete invoice "${editingInvoice.invoice_number}" for ${editingInvoice.customer_name}? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      await deleteInvoice(editingInvoice.id);
      setInvoices((prev) => prev.filter((item) => item.id !== editingInvoice.id));
      setEditingInvoice(null);
    } catch (err: any) {
      alert("Failed to delete invoice: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Download PDF Handler
  const handleDownloadPDF = (e: React.MouseEvent, inv: StoredInvoice) => {
    e.stopPropagation();
    const payload: InvoicePDFPayload = {
      invoiceNumber: inv.invoice_number,
      invoiceDate: inv.invoice_date,
      customerName: inv.customer_name,
      customerEmail: inv.customer_email || undefined,
      customerPhone: inv.customer_phone || undefined,
      items: inv.items || [],
      paymentStatus: inv.payment_status,
      paidAmount: Number(inv.paid_amount) || 0,
      taxRate: Number(inv.tax_rate) || 0,
      taxAmount: Number(inv.tax_amount) || 0,
      discount: Number(inv.discount) || 0,
      subtotal: Number(inv.subtotal) || 0,
      grandTotal: Number(inv.grand_total) || 0,
      remainingBalance: Number(inv.remaining_balance) || 0,
    };

    generateInvoicePDF(payload);
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Billed Invoices" />

      {/* Main Container Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Header Actions & Search Bar */}
        <div className="border-b border-gray-100 p-5 dark:border-white/[0.05]">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                Billed Invoices List
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click any invoice row to view or edit details.
              </p>
            </div>

            <button
              onClick={fetchInvoices}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              Refresh Records
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search invoice, client, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-xs text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex w-full sm:w-auto items-center gap-2">
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-gray-400">
                  <Filter className="h-3.5 w-3.5" />
                </span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-8 text-xs font-medium text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="m-5 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-100 bg-gray-50 uppercase text-gray-500 dark:border-white/[0.05] dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Invoice No</th>
                <th className="px-5 py-3.5 font-semibold">Customer</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold">Total Amount</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    No matching billed invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => handleRowClick(inv)}
                    className="cursor-pointer hover:bg-blue-50/40 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4 font-semibold text-blue-600 dark:text-blue-400">
                      {inv.invoice_number}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {inv.customer_name}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {inv.customer_phone || inv.customer_email || "No contact"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {inv.invoice_date}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        ${Number(inv.grand_total).toFixed(2)}
                      </div>
                      {inv.payment_status === "Partial" && (
                        <div className="text-[11px] text-amber-600 dark:text-amber-400">
                          Due: ${Number(inv.remaining_balance).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
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
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={(e) => handleDownloadPDF(e, inv)}
                        title="Download PDF"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Download className="h-3.5 w-3.5 text-blue-600" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Invoice Modal */}
      {editingInvoice && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Edit Invoice #{editingInvoice.invoice_number}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Update customer data, line items, or payment balance.
                </p>
              </div>
              <button
                onClick={() => setEditingInvoice(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 max-h-[70vh] space-y-6 overflow-y-auto pr-1">
              {/* Meta & Customer Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={editingInvoice.invoice_date}
                    onChange={(e) =>
                      setEditingInvoice({
                        ...editingInvoice,
                        invoice_date: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={editingInvoice.customer_name}
                    onChange={(e) =>
                      setEditingInvoice({
                        ...editingInvoice,
                        customer_name: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingInvoice.customer_email || ""}
                    onChange={(e) =>
                      setEditingInvoice({
                        ...editingInvoice,
                        customer_email: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editingInvoice.customer_phone || ""}
                    onChange={(e) =>
                      setEditingInvoice({
                        ...editingInvoice,
                        customer_phone: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  Line Items
                </h4>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500">
                      <tr>
                        <th className="p-3">Item Description</th>
                        <th className="w-24 p-3">Qty</th>
                        <th className="w-28 p-3">Price ($)</th>
                        <th className="w-28 p-3">Total ($)</th>
                        <th className="w-12 p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {editingInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) =>
                                handleItemChange(idx, "name", e.target.value)
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  idx,
                                  "quantity",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleItemChange(
                                  idx,
                                  "unitPrice",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                          </td>
                          <td className="p-2 font-semibold text-gray-800 dark:text-gray-200">
                            ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              disabled={editingInvoice.items.length === 1}
                              className="text-gray-400 hover:text-red-600 disabled:opacity-30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add item
                </button>
              </div>

              {/* Payment & Totals */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 rounded-xl bg-gray-50/50 p-4 dark:bg-gray-800/40">
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      Payment Status
                    </label>
                    <select
                      value={editingInvoice.payment_status}
                      onChange={(e) => {
                        const newStatus = e.target.value as "Paid" | "Unpaid" | "Partial";
                        recalculateTotals(
                          editingInvoice.items,
                          editingInvoice.tax_rate,
                          editingInvoice.discount,
                          newStatus,
                          editingInvoice.paid_amount
                        );
                      }}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>

                  {editingInvoice.payment_status === "Partial" && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Paid Amount ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingInvoice.paid_amount}
                        onChange={(e) => {
                          const newPaid = parseFloat(e.target.value) || 0;
                          recalculateTotals(
                            editingInvoice.items,
                            editingInvoice.tax_rate,
                            editingInvoice.discount,
                            editingInvoice.payment_status,
                            newPaid
                          );
                        }}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      ${Number(editingInvoice.subtotal).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Tax Rate (%):</span>
                    <input
                      type="number"
                      min="0"
                      value={editingInvoice.tax_rate}
                      onChange={(e) => {
                        const newTax = parseFloat(e.target.value) || 0;
                        recalculateTotals(
                          editingInvoice.items,
                          newTax,
                          editingInvoice.discount,
                          editingInvoice.payment_status,
                          editingInvoice.paid_amount
                        );
                      }}
                      className="w-20 rounded border border-gray-200 bg-white px-2 py-1 text-right text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Discount ($):</span>
                    <input
                      type="number"
                      min="0"
                      value={editingInvoice.discount}
                      onChange={(e) => {
                        const newDisc = parseFloat(e.target.value) || 0;
                        recalculateTotals(
                          editingInvoice.items,
                          editingInvoice.tax_rate,
                          newDisc,
                          editingInvoice.payment_status,
                          editingInvoice.paid_amount
                        );
                      }}
                      className="w-20 rounded border border-gray-200 bg-white px-2 py-1 text-right text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                    <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                      <span>Grand Total:</span>
                      <span>${Number(editingInvoice.grand_total).toFixed(2)}</span>
                    </div>
                  </div>
                  {editingInvoice.payment_status === "Partial" && (
                    <div className="flex justify-between font-medium text-amber-600 dark:text-amber-400">
                      <span>Remaining Due:</span>
                      <span>${Number(editingInvoice.remaining_balance).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer with Delete & Save */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
              <button
                type="button"
                onClick={handleDeleteInvoice}
                disabled={isDeleting || isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700 disabled:opacity-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeleting ? "Deleting..." : "Delete Invoice"}
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingInvoice(null)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={isSaving || isDeleting}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}