import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface InvoiceItemData {
  id?: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoicePDFPayload {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: InvoiceItemData[];
  paymentStatus: "Paid" | "Unpaid" | "Partial";
  paidAmount?: number;
  taxRate?: number;
  discount?: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  remainingBalance: number;
}

/**
 * Generates and triggers browser download of an invoice PDF
 */
export function generateInvoicePDF(payload: InvoicePDFPayload): void {
  const {
    invoiceNumber,
    invoiceDate,
    customerName,
    customerEmail,
    customerPhone,
    items,
    paymentStatus,
    paidAmount = 0,
    taxRate = 0,
    discount = 0,
    subtotal,
    taxAmount,
    grandTotal,
    remainingBalance,
  } = payload;

  if (!customerName.trim()) {
    alert("Please enter the customer's name before generating the invoice.");
    return;
  }

  const doc = new jsPDF();

  // Brand Header & Business Details
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text("PREMIER AUTO HUB", 14, 22);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Egaloya, Bulathsinhala", 14, 28);
  doc.text("Phone: +94 XX XXX XXXX", 14, 33);
  doc.text("Email: billing@premierautohub.com", 14, 38);

  // Invoice Meta Information (Right aligned)
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text("INVOICE", 196, 22, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Invoice No: ${invoiceNumber}`, 196, 28, { align: "right" });
  doc.text(`Date: ${invoiceDate}`, 196, 33, { align: "right" });

  // Status Label & Conditional Colored Value
  doc.text("Status: ", 170, 38, { align: "right" });
  if (paymentStatus === "Paid") {
    doc.setTextColor(22, 163, 74); // Green-600
  } else {
    doc.setTextColor(220, 38, 38); // Red-600
  }
  doc.setFont("helvetica", "bold");
  doc.text(paymentStatus.toUpperCase(), 196, 38, { align: "right" });
  doc.setFont("helvetica", "normal");

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 44, 196, 44);

  // Customer Information Section
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("Bill To:", 14, 52);

  doc.setFontSize(11);
  doc.text(customerName, 14, 58);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  let customerY = 63;
  if (customerEmail) {
    doc.text(`Email: ${customerEmail}`, 14, customerY);
    customerY += 5;
  }
  if (customerPhone) {
    doc.text(`Phone: ${customerPhone}`, 14, customerY);
    customerY += 5;
  }

  // Line Items Table
  const tableData = items.map((item) => [
    item.name || "Item / Service",
    item.quantity.toString(),
    `$${item.unitPrice.toFixed(2)}`,
    `$${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: customerY + 4,
    head: [["Item Description", "Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 95 },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 32, halign: "right" },
      3: { cellWidth: 30, halign: "right" },
    },
  });

  // Totals & Financial Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Subtotal:", 140, finalY);
  doc.text(`$${subtotal.toFixed(2)}`, 196, finalY, { align: "right" });

  doc.text(`Tax (${taxRate}%):`, 140, finalY + 6);
  doc.text(`$${taxAmount.toFixed(2)}`, 196, finalY + 6, { align: "right" });

  doc.text("Discount:", 140, finalY + 12);
  doc.text(`-$${discount.toFixed(2)}`, 196, finalY + 12, { align: "right" });

  // Grand Total Line
  doc.setDrawColor(226, 232, 240);
  doc.line(140, finalY + 16, 196, finalY + 16);

  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text("Grand Total:", 140, finalY + 22);
  doc.text(`$${grandTotal.toFixed(2)}`, 196, finalY + 22, { align: "right" });

  let summaryOffsetY = finalY + 28;

  if (paymentStatus === "Partial") {
    doc.setFontSize(9);
    doc.setTextColor(37, 99, 235);
    doc.text("Paid Amount:", 140, summaryOffsetY);
    doc.text(`$${paidAmount.toFixed(2)}`, 196, summaryOffsetY, {
      align: "right",
    });

    summaryOffsetY += 6;
    doc.setTextColor(220, 38, 38);
    doc.text("Remaining Balance:", 140, summaryOffsetY);
    doc.text(`$${remainingBalance.toFixed(2)}`, 196, summaryOffsetY, {
      align: "right",
    });
  }

  // Footer Note
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Thank you for choosing Premier Auto Hub! Please reach out if you have any questions regarding this invoice.",
    105,
    285,
    { align: "center" }
  );

  // Trigger Save
  doc.save(`${invoiceNumber}_${customerName.replace(/\s+/g, "_")}.pdf`);
}