"use client";

import React, { useState, useEffect, useRef } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  Plus,
  Trash2,
  User,
  CreditCard,
  Download,
  Search,
  RotateCcw,
  Building2,
  Phone,
  Mail,
} from "lucide-react";
import {
  generateInvoicePDF,
  InvoiceItemData,
  InvoicePDFPayload,
} from "@/functions/invoiceGenerator";
import { createInvoice } from "@/functions/invoices";
import { getCustomers } from "@/functions/customers";

interface CustomerOption {
  id: string;
  name: string;
  company?: string | null;
  phone: string | null;
  email: string | null;
}

export default function GenerateInvoicePage() {
  const [isSaving, setIsSaving] = useState(false);

  // Customer Information States
  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Invoice Meta
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${Date.now().toString().slice(-6)}`
  );
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Payment & Calculation States
  const [paymentStatus, setPaymentStatus] = useState<
    "Paid" | "Unpaid" | "Partial"
  >("Unpaid");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  const [items, setItems] = useState<InvoiceItemData[]>([
    { id: "1", name: "", quantity: 1, unitPrice: 0 },
  ]);

  // Autocomplete States
  const [allCustomers, setAllCustomers] = useState<CustomerOption[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerOption[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<"name" | "company" | null>(null);
  const nameInputRef = useRef<HTMLDivElement>(null);
  const companyInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCustomerDirectory();
  }, []);

  const fetchCustomerDirectory = async () => {
    try {
      const data = await getCustomers();
      setAllCustomers(data || []);
    } catch (err: any) {
      console.error("Error loading customer directory:", err.message);
    }
  };

  // Filter customers when typing name or company
  const handleFilterCustomers = (query: string, field: "name" | "company") => {
    if (field === "name") setCustomerName(query);
    if (field === "company") setCustomerCompany(query);

    const trimmed = query.trim().toLowerCase();
    if (trimmed.length > 0) {
      const matches = allCustomers.filter(
        (c) =>
          c.name.toLowerCase().includes(trimmed) ||
          (c.company && c.company.toLowerCase().includes(trimmed)) ||
          (c.phone && c.phone.includes(trimmed)) ||
          (c.email && c.email.toLowerCase().includes(trimmed))
      );
      setFilteredCustomers(matches);
      setActiveDropdown(field);
    } else {
      setFilteredCustomers([]);
      setActiveDropdown(null);
    }
  };

  // Auto-fill all customer details on selection
  const handleSelectCustomer = (customer: CustomerOption) => {
    setCustomerName(customer.name || "");
    setCustomerCompany(customer.company || "");
    setCustomerEmail(customer.email || "");
    setCustomerPhone(customer.phone || "");
    setActiveDropdown(null);
    setFilteredCustomers([]);
  };

  // Reset Customer Data fields
  const handleResetCustomerData = () => {
    setCustomerName("");
    setCustomerCompany("");
    setCustomerEmail("");
    setCustomerPhone("");
    setFilteredCustomers([]);
    setActiveDropdown(null);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideName =
        nameInputRef.current && !nameInputRef.current.contains(target);
      const clickedOutsideCompany =
        companyInputRef.current && !companyInputRef.current.contains(target);

      if (clickedOutsideName && clickedOutsideCompany) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calculation logic
  const subtotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );
  const taxAmount = (subtotal * (taxRate || 0)) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - (discount || 0));
  const remainingBalance =
    paymentStatus === "Paid"
      ? 0
      : paymentStatus === "Unpaid"
      ? grandTotal
      : Math.max(0, grandTotal - (paidAmount || 0));

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), name: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleRemoveItem = (id?: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleItemChange = (
    id: string | undefined,
    field: keyof InvoiceItemData,
    value: string | number
  ) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleGenerateAndSave = async () => {
    if (!customerName.trim()) {
      alert("Please enter the customer's name before proceeding.");
      return;
    }

    const formattedCustomerName = customerCompany.trim()
      ? `${customerName.trim()} (${customerCompany.trim()})`
      : customerName.trim();

    const payload: InvoicePDFPayload = {
      invoiceNumber,
      invoiceDate,
      customerName: formattedCustomerName,
      customerEmail,
      customerPhone,
      items,
      paymentStatus,
      paidAmount,
      taxRate,
      discount,
      subtotal,
      taxAmount,
      grandTotal,
      remainingBalance,
    };

    try {
      setIsSaving(true);
      await createInvoice(payload);
      generateInvoicePDF(payload);
      alert("Invoice generated and saved successfully!");
    } catch (error: any) {
      alert("Failed to save invoice: " + (error.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Create Invoice" />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="space-y-8 p-6">
          {/* Top Meta Info */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-md font-semibold text-gray-700 dark:text-gray-300">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-md text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-md font-semibold text-gray-700 dark:text-gray-300">
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-md text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Customer Details Container */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/40">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                <User className="h-4 w-4 text-blue-600" />
                Customer Information
              </h3>

              <button
                type="button"
                onClick={handleResetCustomerData}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-xs transition hover:bg-gray-100 hover:text-red-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-red-400"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Customer Data
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Customer Name Autocomplete */}
              <div className="relative" ref={nameInputRef}>
                <label className="mb-1 block text-md text-gray-500 dark:text-gray-400">
                  Customer Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Search or type name..."
                    value={customerName}
                    onChange={(e) => handleFilterCustomers(e.target.value, "name")}
                    onFocus={() => {
                      if (customerName.trim().length > 0 && filteredCustomers.length > 0) {
                        setActiveDropdown("name");
                      }
                    }}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-md focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="h-4 w-4" />
                  </span>
                </div>

                {/* Name Dropdown */}
                {activeDropdown === "name" && filteredCustomers.length > 0 && (
                  <div className="absolute left-0 top-full z-50 mt-1 max-h-64 w-full min-w-[280px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                    <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Matching Customers
                    </div>
                    {filteredCustomers.map((cust) => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => handleSelectCustomer(cust)}
                        className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition hover:bg-blue-50 dark:hover:bg-gray-700"
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {cust.name}
                          </span>
                          {cust.company && (
                            <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                              <Building2 className="h-3 w-3" />
                              {cust.company}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          {cust.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {cust.phone}
                            </span>
                          )}
                          {cust.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {cust.email}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Shop / Company Name Autocomplete */}
              <div className="relative" ref={companyInputRef}>
                <label className="mb-1 block text-md text-gray-500 dark:text-gray-400">
                  Shop / Company Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search or type shop..."
                    value={customerCompany}
                    onChange={(e) => handleFilterCustomers(e.target.value, "company")}
                    onFocus={() => {
                      if (customerCompany.trim().length > 0 && filteredCustomers.length > 0) {
                        setActiveDropdown("company");
                      }
                    }}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-md focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Building2 className="h-4 w-4" />
                  </span>
                </div>

                {/* Company Dropdown */}
                {activeDropdown === "company" && filteredCustomers.length > 0 && (
                  <div className="absolute left-0 top-full z-50 mt-1 max-h-64 w-full min-w-[280px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                    <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Matching Shops & Clients
                    </div>
                    {filteredCustomers.map((cust) => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => handleSelectCustomer(cust)}
                        className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition hover:bg-blue-50 dark:hover:bg-gray-700"
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {cust.company || "No Shop Name"}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Owner: {cust.name}
                          </span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          {cust.phone && <span>{cust.phone}</span>}
                          {cust.email && <span>• {cust.email}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="mb-1 block text-md text-gray-500 dark:text-gray-400">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-md focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="mb-1 block text-md text-gray-500 dark:text-gray-400">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+94 77 000 0000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-md focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h3 className="mb-3 text-md font-semibold text-gray-900 dark:text-white">
              Invoice Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-md">
                <thead className="border-b border-gray-200 bg-gray-50 uppercase text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  <tr>
                    <th className="min-w-[200px] px-4 py-3">Item Description</th>
                    <th className="w-28 px-4 py-3">Quantity</th>
                    <th className="w-36 px-4 py-3">Unit Price ($)</th>
                    <th className="w-32 px-4 py-3">Total ($)</th>
                    <th className="w-12 px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Item name / vehicle service..."
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(item.id, "name", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-md focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "quantity",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-md focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-md focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">
                        ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length === 1}
                          className="text-gray-400 hover:text-red-600 disabled:opacity-30 dark:hover:text-red-400"
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
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-md font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </button>
          </div>

          {/* Payment & Summary */}
          <div className="grid grid-cols-1 gap-8 border-t border-gray-100 pt-6 dark:border-gray-800 md:grid-cols-2">
            <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/40">
              <h3 className="flex items-center gap-2 text-md font-semibold text-gray-900 dark:text-white">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Payment Status
              </h3>

              <div>
                <label className="mb-1 block text-md text-gray-500 dark:text-gray-400">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) =>
                    setPaymentStatus(
                      e.target.value as "Paid" | "Unpaid" | "Partial"
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-md focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partial">Partial / Half Payment</option>
                  <option value="Paid">Fully Paid</option>
                </select>
              </div>

              {paymentStatus === "Partial" && (
                <div>
                  <label className="mb-1 block text-md text-gray-500 dark:text-gray-400">
                    Paid Amount ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paidAmount}
                    onChange={(e) =>
                      setPaidAmount(parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-md focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-md text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-md text-gray-600 dark:text-gray-400">
                <span>Tax Rate (%)</span>
                <input
                  type="number"
                  min="0"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-20 rounded border border-gray-200 bg-white px-2 py-1 text-right text-md focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between text-md text-gray-600 dark:text-gray-400">
                <span>Discount ($)</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 rounded border border-gray-200 bg-white px-2 py-1 text-right text-md focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                <div className="flex justify-between text-md font-bold text-gray-900 dark:text-white">
                  <span>Grand Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {paymentStatus === "Partial" && (
                <div className="flex justify-between text-md font-medium text-amber-600 dark:text-amber-400">
                  <span>Remaining Due</span>
                  <span>${remainingBalance.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Submission Bar */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-md font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={handleGenerateAndSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-md font-medium text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 dark:focus:ring-blue-800"
            >
              <Download className="h-4 w-4" />
              {isSaving ? "Saving..." : "Generate & Download PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}