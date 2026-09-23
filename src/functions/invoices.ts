import { createClient } from "@/utils/supabase/client";
import { InvoicePDFPayload } from "@/functions/invoiceGenerator";

const supabase = createClient();

// Extended payload interface to accommodate cashier tracking
export interface InvoicePayloadWithCashier extends InvoicePDFPayload {
  cashierName?: string;
  cashierId?: string;
}

export interface InvoiceRecord extends InvoicePayloadWithCashier {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Save a newly generated invoice to Supabase with Cashier tracking
 */
export async function createInvoice(invoiceData: InvoicePayloadWithCashier) {
  const {
    invoiceNumber,
    invoiceDate,
    cashierName,
    cashierId,
    customerName,
    customerEmail,
    customerPhone,
    items,
    paymentStatus,
    paidAmount = 0,
    taxRate = 0,
    taxAmount,
    discount = 0,
    subtotal,
    grandTotal,
    remainingBalance,
  } = invoiceData;

  const { data, error } = await supabase
    .from("invoices")
    .insert([
      {
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        cashier_name: cashierName || "Admin",
        cashier_id: cashierId || null,
        customer_name: customerName,
        customer_email: customerEmail || null,
        customer_phone: customerPhone || null,
        items: items,
        subtotal: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount: discount,
        grand_total: grandTotal,
        payment_status: paymentStatus,
        paid_amount: paidAmount,
        remaining_balance: remainingBalance,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating invoice:", error.message);
    throw error;
  }

  return data;
}

/**
 * Fetch all stored invoices
 */
export async function getInvoices() {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error.message);
    throw error;
  }

  return data;
}

/**
 * Update an existing invoice in Supabase
 */
export async function updateInvoice(
  id: string,
  updatedData: Partial<InvoicePayloadWithCashier>
) {
  const payload: any = {
    ...updatedData,
    updated_at: new Date().toISOString(),
  };

  // Format keys to match database column names
  if (updatedData.invoiceNumber) payload.invoice_number = updatedData.invoiceNumber;
  if (updatedData.invoiceDate) payload.invoice_date = updatedData.invoiceDate;
  if (updatedData.cashierName !== undefined) payload.cashier_name = updatedData.cashierName;
  if (updatedData.cashierId !== undefined) payload.cashier_id = updatedData.cashierId;
  if (updatedData.customerName) payload.customer_name = updatedData.customerName;
  if (updatedData.customerEmail !== undefined) payload.customer_email = updatedData.customerEmail;
  if (updatedData.customerPhone !== undefined) payload.customer_phone = updatedData.customerPhone;
  if (updatedData.items) payload.items = updatedData.items;
  if (updatedData.subtotal !== undefined) payload.subtotal = updatedData.subtotal;
  if (updatedData.taxRate !== undefined) payload.tax_rate = updatedData.taxRate;
  if (updatedData.taxAmount !== undefined) payload.tax_amount = updatedData.taxAmount;
  if (updatedData.discount !== undefined) payload.discount = updatedData.discount;
  if (updatedData.grandTotal !== undefined) payload.grand_total = updatedData.grandTotal;
  if (updatedData.paymentStatus) payload.payment_status = updatedData.paymentStatus;
  if (updatedData.paidAmount !== undefined) payload.paid_amount = updatedData.paidAmount;
  if (updatedData.remainingBalance !== undefined) payload.remaining_balance = updatedData.remainingBalance;

  // Clean redundant camelCase keys
  delete payload.invoiceNumber;
  delete payload.invoiceDate;
  delete payload.cashierName;
  delete payload.cashierId;
  delete payload.customerName;
  delete payload.customerEmail;
  delete payload.customerPhone;
  delete payload.taxRate;
  delete payload.taxAmount;
  delete payload.grandTotal;
  delete payload.paymentStatus;
  delete payload.paidAmount;
  delete payload.remainingBalance;

  const { data, error } = await supabase
    .from("invoices")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating invoice ${id}:`, error.message);
    throw error;
  }

  return data;
}

export async function deleteInvoice(id: string) {
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) {
    console.error(`Error deleting invoice ${id}:`, error.message);
    throw error;
  }
  return true;
}