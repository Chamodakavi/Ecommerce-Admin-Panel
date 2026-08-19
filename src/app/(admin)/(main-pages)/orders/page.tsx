"use client";

import React, { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  Search,
  Filter,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  AlertCircle,
  FileText,
  Trash2,
} from "lucide-react";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  OrderRecord,
  OrderStatus,
} from "@/functions/orders";
import { createInvoice } from "@/functions/invoices";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("" );
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await getAllOrders();
      setOrders(data || []);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setErrorMessage(err.message || "Failed to load orders from database.");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (order.order_number && order.order_number.toLowerCase().includes(q)) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(q)) ||
        (order.customer_phone && order.customer_phone.includes(q)) ||
        (order.customer_email && order.customer_email.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "All" || order.order_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Helper to auto-create invoice when an order is marked as shipped
  const generateInvoiceForOrder = async (order: OrderRecord) => {
    try {
      const generatedInvoiceNumber = `INV-${order.order_number.replace(/^ORD-?/i, "")}`;

      const invoiceItems = (order.items || []).map((item, idx) => ({
        id: (idx + 1).toString(),
        name: item.name,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.price) || 0,
      }));

      if (Number(order.delivery_fee) > 0) {
        invoiceItems.push({
          id: (invoiceItems.length + 1).toString(),
          name: "Delivery / Shipping Fee",
          quantity: 1,
          unitPrice: Number(order.delivery_fee),
        });
      }

      const isPaid = order.payment_status?.toLowerCase() === "paid";
      const total = Number(order.total_amount) || 0;

      await createInvoice({
        invoiceNumber: generatedInvoiceNumber,
        invoiceDate: new Date().toISOString().split("T")[0],
        customerName: order.customer_name,
        customerEmail: order.customer_email || undefined,
        customerPhone: order.customer_phone || undefined,
        items: invoiceItems,
        paymentStatus: isPaid ? "Paid" : "Unpaid",
        paidAmount: isPaid ? total : 0,
        taxRate: 0,
        taxAmount: 0,
        discount: Number(order.discount) || 0,
        subtotal: Number(order.subtotal) + (Number(order.delivery_fee) || 0),
        grandTotal: total,
        remainingBalance: isPaid ? 0 : total,
      });
    } catch (invErr: any) {
      console.error("Error auto-generating invoice:", invErr.message);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    try {
      setIsUpdatingStatus(true);
      await updateOrderStatus(selectedOrder.id, newStatus);

      if (newStatus === "shipped") {
        await generateInvoiceForOrder(selectedOrder);
      }

      const updated = { ...selectedOrder, order_status: newStatus };
      setSelectedOrder(updated);
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? updated : o))
      );
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      setIsUpdatingStatus(true);
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setSelectedOrder(null);
      alert("Order deleted successfully.");
    } catch (err: any) {
      alert("Failed to delete order: " + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="h-3 w-3" />
            Processing
          </span>
        );
      case "packed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Package className="h-3 w-3" />
            Packed
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            <Truck className="h-3 w-3" />
            Shipped
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Delivered
          </span>
        );
      default:
        return (
          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Orders" />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Header Actions & Search Bar */}
        <div className="border-b border-gray-100 p-5 dark:border-white/[0.05]">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                Order Management
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Track customer orders, packing workflows, and delivery fulfillment.
              </p>
            </div>

            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
              Refresh Orders
            </button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search order #, customer, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-xs text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-gray-400">
                  <Filter className="h-3.5 w-3.5" />
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-8 text-xs font-medium text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <option value="All">All Statuses</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="m-5 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 uppercase text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Order Number</th>
                <th className="px-5 py-3.5 font-semibold">Customer</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold">Items</th>
                <th className="px-5 py-3.5 font-semibold">Total Amount</th>
                <th className="px-5 py-3.5 font-semibold">Payment</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-blue-600" />
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="cursor-pointer transition hover:bg-blue-50/40 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4 font-semibold text-blue-600 dark:text-blue-400">
                      {order.order_number}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {order.customer_name}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {order.customer_phone || order.customer_email || "No contact"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-700 dark:text-gray-300">
                      {Array.isArray(order.items) ? order.items.length : 0} items
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                      LKR {Number(order.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        {order.payment_method || "Cash on Delivery"}
                      </div>
                      <span
                        className={`text-[10px] font-semibold ${
                          order.payment_status === "Paid"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {order.payment_status || "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(order.order_status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Workflow Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Order #{selectedOrder.order_number}
                  </h3>
                  {getStatusBadge(selectedOrder.order_status)}
                </div>
                <p className="text-xs text-gray-400">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-[65vh] space-y-6 overflow-y-auto pr-1 text-xs">
              <div className="grid grid-cols-1 gap-4 rounded-xl bg-gray-50/70 p-4 dark:bg-gray-800/40 sm:grid-cols-2">
                <div>
                  <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">
                    Customer Information
                  </h4>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {selectedOrder.customer_name}
                  </p>
                  {selectedOrder.customer_phone && (
                    <a
                      href={`tel:${selectedOrder.customer_phone}`}
                      className="mt-1 flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                    >
                      <Phone className="h-3 w-3" />
                      {selectedOrder.customer_phone}
                    </a>
                  )}
                  {selectedOrder.customer_email && (
                    <a
                      href={`mailto:${selectedOrder.customer_email}`}
                      className="mt-0.5 flex items-center gap-1 text-gray-500 hover:underline dark:text-gray-400"
                    >
                      <Mail className="h-3 w-3" />
                      {selectedOrder.customer_email}
                    </a>
                  )}
                </div>

                <div>
                  <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">
                    Shipping Address
                  </h4>
                  <p className="flex items-start gap-1 text-gray-600 dark:text-gray-300">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                    {selectedOrder.shipping_address}
                  </p>
                  {selectedOrder.notes && (
                    <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-400">
                      <strong>Note:</strong> {selectedOrder.notes}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Purchased Items
                </h4>
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800/50">
                      <tr>
                        <th className="p-2.5 font-semibold">Item</th>
                        <th className="p-2.5 text-center font-semibold">Qty</th>
                        <th className="p-2.5 text-right font-semibold">Price</th>
                        <th className="p-2.5 text-right font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {(selectedOrder.items || []).map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium text-gray-800 dark:text-gray-200">
                            {item.name}
                          </td>
                          <td className="p-2.5 text-center text-gray-600 dark:text-gray-400">
                            {item.quantity}
                          </td>
                          <td className="p-2.5 text-right text-gray-600 dark:text-gray-400">
                            LKR {Number(item.price).toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right font-semibold text-gray-900 dark:text-white">
                            LKR {(item.quantity * item.price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-1.5 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal:</span>
                    <span>LKR {Number(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery Fee:</span>
                    <span>LKR {Number(selectedOrder.delivery_fee || 0).toFixed(2)}</span>
                  </div>
                  {Number(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>- LKR {Number(selectedOrder.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-1.5 font-bold text-gray-900 dark:border-gray-700 dark:text-white flex justify-between text-sm">
                    <span>Total Amount:</span>
                    <span>LKR {Number(selectedOrder.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Progression */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Update Order Progress
                  </h4>
                  {selectedOrder.order_status === "shipped" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <FileText className="h-3.5 w-3.5" />
                      Invoice Generated
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    disabled={isUpdatingStatus || selectedOrder.order_status === "processing"}
                    onClick={() => handleStatusChange("processing")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      selectedOrder.order_status === "processing"
                        ? "bg-amber-500 text-white"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    1. Mark Processing
                  </button>

                  <button
                    disabled={isUpdatingStatus || selectedOrder.order_status === "packed"}
                    onClick={() => handleStatusChange("packed")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      selectedOrder.order_status === "packed"
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    2. Mark Packed
                  </button>

                  <button
                    disabled={isUpdatingStatus || selectedOrder.order_status === "shipped"}
                    onClick={() => handleStatusChange("shipped")}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      selectedOrder.order_status === "shipped"
                        ? "bg-purple-600 text-white"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    <Truck className="h-3.5 w-3.5" />
                    3. Mark Shipped & Generate Invoice
                  </button>

                  <button
                    disabled={isUpdatingStatus || selectedOrder.order_status === "delivered"}
                    onClick={() => handleStatusChange("delivered")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      selectedOrder.order_status === "delivered"
                        ? "bg-emerald-600 text-white"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    4. Mark Delivered
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
              <button
                type="button"
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Order
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
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