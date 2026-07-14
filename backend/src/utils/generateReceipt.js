const PDFDocument = require('pdfkit');

// Streams a branded fee receipt PDF into a Buffer — pure JS, no native deps,
// safe on low-RAM machines. Falls back to plain text header/footer if the
// institute hasn't configured a logo/contact info yet (never breaks).
const generateReceiptPDF = ({ institute, fee, student }) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const branding = institute.branding || {};
    const primaryColor = branding.primaryColor || '#2563EB';
    const displayName = branding.displayName || institute.name;

    // Header
    doc.fillColor(primaryColor).fontSize(20).text(displayName, { align: 'center' });
    if (branding.tagline) {
      doc.fillColor('#6b7280').fontSize(10).text(branding.tagline, { align: 'center' });
    }
    doc.moveDown(1.5);

    doc.fillColor('#000000').fontSize(16).text('Fee Payment Receipt', { align: 'center', underline: true });
    doc.moveDown(1.5);

    // Details table (simple key-value layout)
    const rows = [
      ['Receipt No.', String(fee._id)],
      ['Student Name', student.name],
      ['Student Email', student.email],
      ['Amount Paid', `₹${fee.amount}`],
      ['Payment Method', fee.paymentMethod === 'razorpay' ? 'Online (Razorpay)' : 'Manual/Cash'],
      ['Payment Date', fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : '—'],
      ['Due Date', new Date(fee.dueDate).toLocaleDateString()],
      ['Status', fee.status.toUpperCase()],
    ];

    rows.forEach(([label, value]) => {
      doc.fontSize(11).fillColor('#374151').text(`${label}:`, { continued: true, width: 200 });
      doc.fillColor('#000000').text(`  ${value}`);
      doc.moveDown(0.3);
    });

    doc.moveDown(2);

    // Footer — contact info
    const contactLines = [branding.contactPhone, branding.contactEmail, branding.contactAddress].filter(Boolean);
    if (contactLines.length > 0) {
      doc
        .fontSize(9)
        .fillColor('#9ca3af')
        .text(contactLines.join(' | '), { align: 'center' });
    }
    doc.fontSize(8).fillColor('#d1d5db').text('This is a system-generated receipt.', { align: 'center' });

    doc.end();
  });
};

module.exports = { generateReceiptPDF };