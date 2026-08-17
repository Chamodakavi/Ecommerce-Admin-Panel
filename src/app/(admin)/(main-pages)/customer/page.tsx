"use client";

import React, { useEffect, useState, useMemo } from "react";
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithMetrics | null>(null);
  const [formData, setFormData] = useState<CustomerPayload>({
    name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    fetchCustomersAndMetrics();
  }, []);

  const fetchCustomersAndMetrics = async () => {
    try {
      setLoading(true);
      const [custList, { data: invList, error: invErr }] = await Promise.all([
        getCustomers(),
        supabase
          .from("invoices")
          .select("customer_name, customer_phone, grand_total, remaining_balance"),
      ]);

      if (invErr) throw invErr;

      // Map metrics from invoices by matching customer name or phone
      const enriched: CustomerWithMetrics[] = (custList || []).map((cust: any) => {
        let spent = 0;
        let invCount = 0;
        let due = 0;

        (invList || []).forEach((inv) => {
          const matchName =
            inv.customer_name &&
            inv.customer_name.trim().toLowerCase() === cust.name.trim().toLowerCase();
          const matchPhone =
            cust.phone &&
            inv.customer_phone &&
            inv.customer_phone.trim() === cust.phone.trim();

          if (matchName || matchPhone) {
            spent += Number(inv.grand_total) || 0;
            due += Number(inv.remaining_balance) || 0;
            invCount += 1;
          }
        });

        return {
          ...cust,
          totalSpent: spent,
          totalInvoices: invCount,
          unpaidBalance: due,
        };
      });

      setCustomers(enriched);
    } catch (err: any) {
      console.error("Error loading customers:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    });
  }, [customers, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({ name: "", company: "", phone: "", email: "", address: "", notes: "" });
    setIsModalOpen(true);
  };

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

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSaving(true);
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
      } else {
        await createCustomer(formData);
      }
      setIsModalOpen(false);
      fetchCustomersAndMetrics();
    } catch (err: any) {
      alert("Error saving customer: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer "${name}"?`)) return;
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert("Error deleting customer: " + err.message);
    }
  };

  const totalClients = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOutstanding = customers.reduce((sum, c) => sum + c.unpaidBalance, 0);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Customer Directory" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>

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
            ${totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
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
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Customer
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 uppercase text-gray-500 dark:bg-gray-800/50">
              <tr>
                <th className="px-5 py-3 font-semibold">Customer & Shop</th>
                <th className="px-5 py-3 font-semibold">Contact Info</th>
                <th className="px-5 py-3 font-semibold">Invoices</th>
                <th className="px-5 py-3 font-semibold">Total Spent</th>
                <th className="px-5 py-3 font-semibold">Outstanding Due</th>
                <th className="px-5 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-blue-600" />
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
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
                        <div className="text-[11px] font-normal text-gray-400">{cust.address}</div>
                      )}
                    </td>
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
                          <span className="text-gray-400">No phone</span>
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
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        <Receipt className="h-3 w-3 text-gray-500" />
                        {cust.totalInvoices} bills
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                      ${cust.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      {cust.unpaidBalance > 0 ? (
                        <span className="font-bold text-red-600 dark:text-red-400">
                          ${cust.unpaidBalance.toFixed(2)}
                        </span>
                      ) : (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          Cleared
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(cust)}
                          title="Edit Customer"
                          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cust.id, cust.name)}
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

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingCustomer ? "Edit Customer Details" : "Add New Customer"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="mt-4 space-y-4 text-xs">
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+94 77 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  Address / City
                </label>
                <input
                  type="text"
                  placeholder="Colombo, Sri Lanka"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  Notes / Vehicle Reg No
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Regular client for maintenance (WP CAD-1234)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isSaving ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}