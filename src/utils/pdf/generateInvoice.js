import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { currencyConfig } from '../../config';

const generateInvoice = (caseId, clientDetails, orderDetails, products, calculateGrandTotal) => {
    const doc = new jsPDF();

    // Title for Invoice
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0); // Black
    doc.text("COMMERCIAL INVOICE", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice #: ${caseId.slice(-6).toUpperCase()}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);

    // Client Details
    doc.setFontSize(11);
    doc.setTextColor(50); // Darker gray

    let yPos = 50;
    doc.text("Bill To:", 14, yPos);
    yPos += 7;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`${clientDetails.clientName || clientDetails.businessName || 'N/A'}`, 14, yPos);

    doc.setFontSize(10);
    doc.setTextColor(100);
    yPos += 5;
    if (clientDetails.businessAddress) {
        doc.text(`${clientDetails.businessAddress}`, 14, yPos);
        yPos += 5;
    }
    if (clientDetails.taxId) {
        doc.text(`TIN/Tax ID: ${clientDetails.taxId}`, 14, yPos);
    }

    // Order Details (Right side)
    yPos = 50;
    doc.text("Order Details:", 110, yPos);
    yPos += 7;
    doc.text(`Due Date: ${orderDetails.leadTime}`, 110, yPos);
    yPos += 5;
    doc.text(`Terms: ${orderDetails.terms ? orderDetails.terms + ' Days' : 'N/A'}`, 110, yPos);


    // Table Data
    const tableColumn = ["Item Description", "Condition", "Unit Price", "Qty", "Amount"];
    const tableRows = [];

    products.forEach(product => {
        if (product.name) {
            const productData = [
                product.name,
                product.condition || 'Brand New',
                `${currencyConfig.code} ${product.price ? product.price.toFixed(2) : '0.00'}`,
                product.quantity || 1,
                `${currencyConfig.code} ${((product.price || 0) * (product.quantity || 1)).toFixed(2)}`
            ];
            tableRows.push(productData);
        }
    });

    // Generate Table with different styling for Invoice
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 90,
        theme: 'striped',
        headStyles: {
            fillColor: [41, 37, 36], // Dark grey/black
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 10,
            cellPadding: 5
        },
        columnStyles: {
            0: { cellWidth: 80 }, // Description
            4: { halign: 'right' } // Total
        }
    });

    // Grand Total Section
    const finalY = doc.lastAutoTable?.finalY || 100;

    doc.setDrawColor(200);
    doc.line(120, finalY + 5, 195, finalY + 5);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(`Total Amount:`, 130, finalY + 12);
    doc.text(`${currencyConfig.code} ${calculateGrandTotal()}`, 195, finalY + 12, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Thank you for your business.", 105, 280, { align: 'center' });

    // Save PDF
    doc.save(`Invoice_${caseId}.pdf`);
};

export default generateInvoice;
