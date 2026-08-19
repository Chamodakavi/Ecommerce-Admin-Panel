"use client";

import React, { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  Search,
  Truck,
  PackageCheck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { updateOrderStatus, OrderStatus } from "@/functions/orders";

const supabase = createClient();

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderRecord {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function ShippedOrdersPage() {
  const [shippedOrders, setShippedOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    fetchShippedOrders();
  }, []);

  const fetchShippedOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .in("order_status", ["shipped", "delivered"])
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setShippedOrders(data || []);
    } catch (err: any) {
      console.error("Error fetching shipped orders:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return shippedOrders.filter((order) => {
      const q = searchQuery.toLowerCase();
      return (
        (order.order_number && order.order_number.toLowerCase().includes(q)) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(q)) ||
        (order.customer_phone && order.customer_phone.includes(q)) ||
        (order.customer_email && order.customer_email.toLowerCase().includes(q))
      );
    });
  }, [shippedOrders, searchQuery]);

  // Mark as Delivered
  const handleMarkDelivered = async (orderId: string) => {
    try {
      setIsUpdating(true);
      await updateOrderStatus(orderId, "delivered");
      
      setShippedOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: "delivered" } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, order_status: "delivered" });
      }
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Metrics
  const totalShippedCount = shippedOrders.filter((o) => o.order_status === "shipped").length;
  const totalDeliveredCount = shippedOrders.filter((o) => o.order_status === "delivered").length;
  const totalShippedRevenue = shippedOrders.reduce(
    (sum, o) => sum + (Number(o.total_amount) || 0),
    0
  );

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Shipped Orders" />

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Active In-Transit */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              In-Transit / Shipped
            </span>
            <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/30">
              <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
            {totalShippedCount}
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Currently out for courier delivery</p>
        </div>

        {/* Successfully Delivered */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Delivered Orders
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/30">
              <PackageCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalDeliveredCount}
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Completed deliveries</p>
        </div>

        {/* Shipped Value */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Total Dispatched Value
            </span>
            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/30">
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            LKR {totalShippedRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Total volume dispatched</p>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Header Actions & Search Bar */}
        <div className="border-b border-gray-100 p-5 dark:border-white/[0.05]">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                Shipped Order List
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage parcels currently in-transit and confirm completed handovers.
              </p>
            </div>

            <button
              onClick={fetchShippedOrders}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
              Refresh
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full max-w-xs">
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
          </div>
        </div>

        {/* Shipped Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 uppercase text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Order Number</th>
                <th className="px-5 py-3.5 font-semibold">Customer</th>
                <th className="px-5 py-3.5 font-semibold">Destination Address</th>
                <th className="px-5 py-3.5 font-semibold">Items</th>
                <th className="px-5 py-3.5 font-semibold">Total Amount</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-blue-600" />
                    Loading dispatched orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No shipped orders found.
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
                    <td className="max-w-[220px] truncate px-5 py-4 text-gray-600 dark:text-gray-300">
                      {order.shipping_address}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-700 dark:text-gray-300">
                      {Array.isArray(order.items) ? order.items.length : 0} items
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                      LKR {Number(order.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          order.order_status === "delivered"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        }`}
                      >
                        {order.order_status === "delivered" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Truck className="h-3 w-3" />
                        )}
                        {order.order_status === "delivered" ? "Delivered" : "Shipped"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      {order.order_status === "shipped" && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleMarkDelivered(order.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Modal View */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Shipped Order #{selectedOrder.order_number}
                  </h3>
                  <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    {selectedOrder.order_status}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Last updated: {new Date(selectedOrder.updated_at || selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 max-h-[65vh] space-y-6 overflow-y-auto pr-1 text-xs">
              <div className="grid grid-cols-1 gap-4 rounded-xl bg-gray-50/70 p-4 dark:bg-gray-800/40 sm:grid-cols-2">
                <div>
                  <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">
                    Recipient
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
                    Delivery Address
                  </h4>
                  <p className="flex items-start gap-1 text-gray-600 dark:text-gray-300">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                    {selectedOrder.shipping_address}
                  </p>
                  {selectedOrder.notes && (
                    <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-400">
                      <strong>Courier / Note:</strong> {selectedOrder.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Package Contents
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

              {/* Cost Summary */}
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-1.5 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal:</span>
                    <span>LKR {Number(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery Fee:</span>
                    <span>LKR {Number(selectedOrder.delivery_fee).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-1.5 font-bold text-gray-900 dark:border-gray-700 dark:text-white flex justify-between text-sm">
                    <span>Total Dispatched:</span>
                    <span>LKR {Number(selectedOrder.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
              {selectedOrder.order_status === "shipped" ? (
                <button
                  disabled={isUpdating}
                  onClick={() => handleMarkDelivered(selectedOrder.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Handover / Delivered
                </button>
              ) : (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ Delivery Complete
                </span>
              )}

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