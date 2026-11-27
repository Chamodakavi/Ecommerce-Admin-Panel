
"use client";

import React, { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  Search,
  UserPlus,
  Users,
  Phone,
  Mail,
  Receipt,
  DollarSign,
  AlertTriangle,
  X,
  Save,
  Loader2,
  Trash2,
  Edit,
  Building2,
  FileText,
  AlertCircle,
} from "lucide-react";

import { createClient } from "@/utils/supabase/client";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  CustomerPayload,
} from "@/functions/customers";

const supabase = createClient();

interface StoredInvoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone: string;
  grand_total: number;
  remaining_balance: number;
  payment_status: "Paid" | "Unpaid" | "Partial";
  created_at: string;
}

interface CustomerWithMetrics {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  totalSpent: number;
  totalInvoices: number;
  unpaidBalance: number;
}

const emptyForm: CustomerPayload = {
  name: "",
  company: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

const formatCurrency = (amount: number) =>
  `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerWithMetrics | null>(null);
  const [formData, setFormData] =
    useState<CustomerPayload>(emptyForm);

  // Invoice History Modal
  const [isInvoicesModalOpen, setIsInvoicesModalOpen] =
    useState(false);
  const [selectedCustomerForInvoices, setSelectedCustomerForInvoices] =
    useState<CustomerWithMetrics | null>(null);
  const [customerInvoices, setCustomerInvoices] =
    useState<StoredInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // ----------------------------------------
  // FETCH CUSTOMERS AND INVOICE METRICS
  // ----------------------------------------

  const fetchCustomersAndMetrics = async () => {
    try {
      setLoading(true);

      const [custList, { data: invList, error: invErr }] =
        await Promise.all([
          getCustomers(),
          supabase
            .from("invoices")
            .select(
              "id, invoice_number, customer_name, customer_phone, grand_total, remaining_balance, payment_status, created_at"
            ),
        ]);

      if (invErr) throw invErr;

      const invoices = invList || [];

      const enriched: CustomerWithMetrics[] = (custList || []).map(
        (cust: any) => {
          const matchedInvoices = invoices.filter((inv) => {
            const matchName =
              inv.customer_name &&
              inv.customer_name.trim().toLowerCase() ===
                cust.name.trim().toLowerCase();

            const matchPhone =
              cust.phone &&
              inv.customer_phone &&
              inv.customer_phone.trim() === cust.phone.trim();

            return matchName || matchPhone;
          });

          const totalSpent = matchedInvoices.reduce(
            (sum, inv) => sum + (Number(inv.grand_total) || 0),
            0
          );

          const unpaidBalance = matchedInvoices.reduce(
            (sum, inv) => sum + (Number(inv.remaining_balance) || 0),
            0
          );

          return {
            ...cust,
            totalSpent,
            totalInvoices: matchedInvoices.length,
            unpaidBalance,
          };
        }
      );

      setCustomers(enriched);
    } catch (err: any) {
      console.error("Error loading customers:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersAndMetrics();
  }, []);

  // ----------------------------------------
  // SEARCH CUSTOMERS
  // ----------------------------------------

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    if (!q) return customers;

    return customers.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    });
  }, [customers, searchQuery]);

  // ----------------------------------------
  // ADD CUSTOMER
  // ----------------------------------------

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({ ...emptyForm });
    setIsModalOpen(true);
  };

  // ----------------------------------------
  // EDIT CUSTOMER
  // ----------------------------------------

  const handleOpenEditModal = (cust: CustomerWithMetrics) => {
    setEditingCustomer(cust);

    setFormData({
      name: cust.name,
      company: cust.company || "",
      phone: cust.phone || "",
      email: cust.email || "",
      address: cust.address || "",
      notes: cust.notes || "",
    });

    setIsModalOpen(true);
  };

  // ----------------------------------------
  // SAVE CUSTOMER
  // ----------------------------------------

  const handleSaveCustomer = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Customer name is required.");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        ...formData,
        name: formData.name.trim(),
      };

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, payload);
      } else {
        await createCustomer(payload);
      }

      setIsModalOpen(false);
      setEditingCustomer(null);
      setFormData({ ...emptyForm });

      await fetchCustomersAndMetrics();
    } catch (err: any) {
      alert("Error saving customer: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------------------------------
  // DELETE CUSTOMER
  // ----------------------------------------

  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete customer "${name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteCustomer(id);

      setCustomers((prev) =>
        prev.filter((customer) => customer.id !== id)
      );
    } catch (err: any) {
      alert("Error deleting customer: " + err.message);
    }
  };

  // ----------------------------------------
  // OPEN CUSTOMER INVOICE HISTORY
  // ----------------------------------------

  const handleOpenInvoicesModal = async (
    cust: CustomerWithMetrics
  ) => {
    setSelectedCustomerForInvoices(cust);
    setCustomerInvoices([]);
    setIsInvoicesModalOpen(true);
    setLoadingInvoices(true);

    try {
      // Fetch invoices and filter by customer name / phone.
      // Filtering in JavaScript avoids unsafe PostgREST .or() strings.

      let query = supabase
        .from("invoices")
        .select(
          "id, invoice_number, customer_name, customer_phone, grand_total, remaining_balance, payment_status, created_at"
        )
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const normalizedName = cust.name.trim().toLowerCase();
      const normalizedPhone = cust.phone?.trim();

      const matchedInvoices = (data || []).filter((inv) => {
        const matchName =
          inv.customer_name?.trim().toLowerCase() === normalizedName;

        const matchPhone =
          normalizedPhone &&
          inv.customer_phone?.trim() === normalizedPhone;

        return matchName || matchPhone;
      });

      setCustomerInvoices(matchedInvoices as StoredInvoice[]);
    } catch (err: any) {
      console.error("Error fetching customer invoices:", err.message);
      alert("Error loading invoices: " + err.message);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // ----------------------------------------
  // CLOSE MODALS
  // ----------------------------------------

  const closeCustomerModal = () => {
    if (isSaving) return;

    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const closeInvoicesModal = () => {
    if (loadingInvoices) return;

    setIsInvoicesModalOpen(false);
    setSelectedCustomerForInvoices(null);
    setCustomerInvoices([]);
  };

  // ----------------------------------------
  // KPI METRICS
  // ----------------------------------------

  const totalClients = customers.length;

  const totalRevenue = customers.reduce(
    (sum, c) => sum + c.totalSpent,
    0
  );

  const totalOutstanding = customers.reduce(
    (sum, c) => sum + c.unpaidBalance,
    0
  );

  // ========================================
  // MAIN JSX
  // ========================================

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Customer Directory" />

      {/* ================================== */}
      {/* KPI CARDS */}
      {/* ================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Total Clients */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Total Clients
            </span>

            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/30">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {totalClients}
          </div>
        </div>

        {/* Lifetime Revenue */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Client Lifetime Revenue
            </span>

            <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/30">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalRevenue)}
          </div>
        </div>

        {/* Outstanding Balance */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Pending Receivables
            </span>

            <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/30">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalOutstanding)}
          </div>
        </div>
      </div>

      {/* ================================== */}
      {/* CUSTOMER TABLE */}
      {/* ================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

        {/* Search and Add Customer */}

        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">

          <div className="relative w-full max-w-xs">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="h-4 w-4" />
            </span>

            <input
              type="text"
              placeholder="Search by name, shop, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-xs text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Customer
          </button>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">

            <thead className="bg-gray-50 uppercase text-gray-500 dark:bg-gray-800/50">
              <tr>
                <th className="px-5 py-3 font-semibold">
                  Customer & Shop
                </th>

                <th className="px-5 py-3 font-semibold">
                  Contact Info
                </th>

                <th className="px-5 py-3 font-semibold">
                  Invoices
                </th>

                <th className="px-5 py-3 font-semibold">
                  Total Spent
                </th>

                <th className="px-5 py-3 font-semibold">
                  Outstanding Due
                </th>

                <th className="px-5 py-3 text-center font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">

              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-gray-400"
                  >
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-blue-600" />
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-gray-400"
                  >
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="transition hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                  >

                    {/* Customer Details */}

                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{cust.name}</span>

                        {cust.company && (
                          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                            <Building2 className="h-3 w-3" />
                            {cust.company}
                          </span>
                        )}
                      </div>

                      {cust.address && (
                        <div className="text-[11px] font-normal text-gray-400">
                          {cust.address}
                        </div>
                      )}
                    </td>

                    {/* Contact Details */}

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">

                        {cust.phone ? (
                          <a
                            href={`tel:${cust.phone}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                          >
                            <Phone className="h-3 w-3" />
                            {cust.phone}
                          </a>
                        ) : (
                          <span className="text-gray-400">
                            No phone
                          </span>
                        )}

                        {cust.email && (
                          <a
                            href={`mailto:${cust.email}`}
                            className="inline-flex items-center gap-1 text-gray-500 hover:underline dark:text-gray-400"
                          >
                            <Mail className="h-3 w-3" />
                            {cust.email}
                          </a>
                        )}

                      </div>
                    </td>

                    {/* INVOICES COLUMN - OPENS HISTORY MODAL */}

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleOpenInvoicesModal(cust)}
                        title="View Customer Bills"
                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 font-medium text-blue-700 transition hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        {cust.totalInvoices} bills
                      </button>
                    </td>

                    {/* TOTAL SPENT */}

                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                      {formatCurrency(cust.totalSpent)}
                    </td>

                    {/* OUTSTANDING BALANCE */}

                    <td className="px-5 py-4">
                      {cust.unpaidBalance > 0 ? (
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(cust.unpaidBalance)}
                        </span>
                      ) : (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          Cleared
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">

                        {/* EDIT BUTTON */}

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(cust)}
                          title="Edit Customer"
                          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        {/* DELETE BUTTON */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(cust.id, cust.name)
                          }
                          title="Delete Customer"
                          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-800 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* ================================== */}
      {/* ADD / EDIT CUSTOMER MODAL */}
      {/* ================================== */}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeCustomerModal();
            }
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingCustomer
                  ? "Edit Customer Details"
                  : "Add New Customer"}
              </h3>

              <button
                type="button"
                onClick={closeCustomerModal}
                disabled={isSaving}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer Form */}

            <form
              onSubmit={handleSaveCustomer}
              className="mt-4 space-y-4 text-xs"
            >

              {/* Name and Company */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasun Perera"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                    Shop / Company Name
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Apex Auto Hub"
                    value={formData.company || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

              </div>

              {/* Phone and Email */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>

                  <input
                    type="tel"
                    placeholder="+94 77 123 4567"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

              </div>

              {/* Address */}

              <div>
                <label className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  Address / City
                </label>

                <input
                  type="text"
                  placeholder="Colombo, Sri Lanka"
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Notes */}

              <div>
                <label className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  Notes / Vehicle Reg No
                </label>

                <textarea
                  rows={2}
                  placeholder="e.g. Regular client for maintenance (WP CAD-1234)"
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notes: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Form Actions */}

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">

                <button
                  type="button"
                  onClick={closeCustomerModal}
                  disabled={isSaving}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}

                  {isSaving
                    ? "Saving..."
                    : editingCustomer
                    ? "Update Customer"
                    : "Save Customer"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================================== */}
      {/* CUSTOMER INVOICE HISTORY MODAL */}
      {/* IMPORTANT: THIS IS A SIBLING OF THE EDIT MODAL */}
      {/* ================================== */}

      {isInvoicesModalOpen && selectedCustomerForInvoices && (
        <div
          className="fixed inset-0 z-[99998] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeInvoicesModal();
            }
          }}
        >
          <div className="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">

            {/* Invoice Modal Header */}

            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Invoices for {selectedCustomerForInvoices.name}
                </h3>

                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  View all billed invoices and track unpaid or partially paid balances.
                </p>
              </div>

              <button
                type="button"
                onClick={closeInvoicesModal}
                disabled={loadingInvoices}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* Invoice List */}

            <div className="mt-5 max-h-[60vh] space-y-3 overflow-y-auto pr-1">

              {loadingInvoices ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-blue-600" />

                  <p className="text-xs text-gray-400">
                    Loading customer bills...
                  </p>
                </div>
              ) : customerInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">

                  <FileText className="h-10 w-10 text-gray-300 dark:text-gray-700" />

                  <p className="mt-3 text-xs font-medium text-gray-600 dark:text-gray-400">
                    No invoices recorded for this customer.
                  </p>

                </div>
              ) : (
                customerInvoices.map((inv) => {

                  const isUnpaidOrPartial =
                    inv.payment_status === "Unpaid" ||
                    inv.payment_status === "Partial";

                  const badgeClass =
                    inv.payment_status === "Paid"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : inv.payment_status === "Partial"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

                  return (
                    <div
                      key={inv.id}
                      className={`flex flex-col gap-2 rounded-xl border p-4 transition ${
                        isUnpaidOrPartial
                          ? "border-red-200 bg-red-50/40 dark:border-red-900/40 dark:bg-red-900/10"
                          : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800/40"
                      }`}
                    >

                      {/* Invoice Number and Status */}

                      <div className="flex items-center justify-between gap-3">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {inv.invoice_number}
                          </span>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}
                          >
                            {inv.payment_status}
                          </span>

                        </div>

                        <span className="shrink-0 text-xs text-gray-400">
                          {new Date(inv.created_at).toLocaleDateString()}
                        </span>

                      </div>

                      {/* Invoice Amounts */}

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-2 text-xs dark:border-gray-800">

                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Total:{" "}
                          </span>

                          <span className="font-bold text-gray-800 dark:text-gray-200">
                            {formatCurrency(Number(inv.grand_total) || 0)}
                          </span>
                        </div>

                        {isUnpaidOrPartial && (
                          <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400">

                            <AlertCircle className="h-3.5 w-3.5" />

                            <span>
                              Due:{" "}
                              {formatCurrency(
                                Number(inv.remaining_balance) || 0
                              )}
                            </span>

                          </div>
                        )}

                      </div>

                    </div>
                  );
                })
              )}

            </div>

            {/* Invoice Modal Footer */}

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">

              <span className="text-xs text-gray-500 dark:text-gray-400">
                Total Bills:{" "}
                <span className="font-bold text-gray-800 dark:text-white">
                  {customerInvoices.length}
                </span>
              </span>

              <button
                type="button"
                onClick={closeInvoicesModal}
                disabled={loadingInvoices}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
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
