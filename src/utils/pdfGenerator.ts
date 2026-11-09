import { jsPDF } from 'jspdf';
import { Invoice, UserProfile } from '../types';
import { formatCurrency } from './calculations';

export function generateInvoicePDF(invoice: Invoice, businessProfile: UserProfile): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header background banner (Dark Navy)
  doc.setFillColor(10, 15, 29);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Brand Name & Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('NEXVORA AI', 18, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(56, 189, 248); // Cyan
  doc.text('Your Business. Your Intelligence. Your Growth.', 18, 24);

  // Invoice Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', pageWidth - 18, 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`#${invoice.invoiceNumber}`, pageWidth - 18, 27, { align: 'right' });
  doc.text(`Status: ${invoice.status.toUpperCase()}`, pageWidth - 18, 33, { align: 'right' });

  y = 52;

  // Business Info (Left)
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('ISSUED BY:', 18, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(businessProfile.businessName || 'My Business', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  let bY = y + 11;
  if (businessProfile.cacNumber) {
    doc.text(`CAC / Reg No: ${businessProfile.cacNumber}`, 18, bY);
    bY += 5;
  }
  if (businessProfile.email) {
    doc.text(`Email: ${businessProfile.email}`, 18, bY);
    bY += 5;
  }
  if (businessProfile.phone) {
    doc.text(`Phone: ${businessProfile.phone}`, 18, bY);
    bY += 5;
  }
  if (businessProfile.address) {
    doc.text(`Address: ${businessProfile.address}`, 18, bY);
    bY += 5;
  }

  // Client Info (Right)
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BILLED TO:', pageWidth - 80, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(invoice.clientName, pageWidth - 80, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  let cY = y + 11;
  doc.text(`Email: ${invoice.clientEmail}`, pageWidth - 80, cY);
  cY += 5;
  if (invoice.clientPhone) {
    doc.text(`Phone: ${invoice.clientPhone}`, pageWidth - 80, cY);
    cY += 5;
  }
  if (invoice.clientAddress) {
    doc.text(`Address: ${invoice.clientAddress}`, pageWidth - 80, cY);
    cY += 5;
  }
  doc.text(`Date: ${invoice.issueDate}`, pageWidth - 80, cY);
  cY += 5;
  doc.text(`Due Date: ${invoice.dueDate}`, pageWidth - 80, cY);

  y = Math.max(bY, cY) + 10;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(18, y, pageWidth - 36, 8, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  doc.text('ITEM DESCRIPTION', 22, y + 5.5);
  doc.text('QTY', pageWidth - 85, y + 5.5, { align: 'right' });
  doc.text('UNIT PRICE', pageWidth - 50, y + 5.5, { align: 'right' });
  doc.text('AMOUNT', pageWidth - 22, y + 5.5, { align: 'right' });

  y += 10;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  invoice.items.forEach((item, index) => {
    // Alternating faint row background
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(18, y - 2, pageWidth - 36, 8, 'F');
    }

    doc.text(item.description, 22, y + 3.5);
    doc.text(String(item.quantity), pageWidth - 85, y + 3.5, { align: 'right' });
    doc.text(formatCurrency(item.unitPrice, invoice.currency), pageWidth - 50, y + 3.5, { align: 'right' });
    doc.text(formatCurrency(item.total, invoice.currency), pageWidth - 22, y + 3.5, { align: 'right' });

    y += 8;
  });

  y += 6;

  // Totals box on right side
  const totalsX = pageWidth - 85;
  doc.setDrawColor(226, 232, 240);
  doc.line(totalsX - 10, y, pageWidth - 18, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalsX, y);
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), pageWidth - 22, y, { align: 'right' });
  y += 6;

  if (invoice.discountRate > 0) {
    doc.text(`Discount (${invoice.discountRate}%):`, totalsX, y);
    doc.text(`-${formatCurrency(invoice.discountAmount, invoice.currency)}`, pageWidth - 22, y, { align: 'right' });
    y += 6;
  }

  if (invoice.taxRate > 0) {
    doc.text(`Tax / VAT (${invoice.taxRate}%):`, totalsX, y);
    doc.text(`+${formatCurrency(invoice.taxAmount, invoice.currency)}`, pageWidth - 22, y, { align: 'right' });
    y += 6;
  }

  doc.setLineWidth(0.5);
  doc.setDrawColor(37, 99, 235);
  doc.line(totalsX - 10, y, pageWidth - 18, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL DUE:', totalsX, y);
  doc.text(formatCurrency(invoice.total, invoice.currency), pageWidth - 22, y, { align: 'right' });

  y += 16;

  // Payment Instructions & Notes
  if (businessProfile.bankDetails?.bankName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('PAYMENT DETAILS / BANK TRANSFER:', 18, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Bank: ${businessProfile.bankDetails.bankName}`, 18, y);
    y += 4.5;
    doc.text(`Account Name: ${businessProfile.bankDetails.accountName}`, 18, y);
    y += 4.5;
    doc.text(`Account Number: ${businessProfile.bankDetails.accountNumber}`, 18, y);
    y += 7;
  }

  if (invoice.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Notes & Terms:', 18, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(invoice.notes, 18, y, { maxWidth: pageWidth - 36 });
  }

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Generated by NEXVORA AI — Your Business. Your Intelligence. Your Growth.', pageWidth / 2, 285, {
    align: 'center',
  });

  // Save PDF
  doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
}
