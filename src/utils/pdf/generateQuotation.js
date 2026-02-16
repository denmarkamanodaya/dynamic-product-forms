import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { currencyConfig } from '../../config';

const generateQuotation = (caseId, clientDetails, orderDetails, products, calculateGrandTotal) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Product Order Summary", 14, 22);

    // Client Details
    doc.setFontSize(11);
    doc.setTextColor(100);

    let yPos = 32;
    doc.text(`Client: ${clientDetails.clientName || 'N/A'}`, 14, yPos);
    doc.text(`Business: ${clientDetails.businessName || 'N/A'}`, 110, yPos);

    yPos += 7;
    doc.text(`Tax ID: ${clientDetails.taxId || 'N/A'}`, 14, yPos);
    doc.text(`Address: ${clientDetails.businessAddress || 'N/A'}`, 110, yPos);

    yPos += 7;
    doc.text(`Lead Time: ${orderDetails.leadTime}`, 14, yPos);
    doc.text(`Terms: ${orderDetails.terms ? orderDetails.terms + ' Days' : 'N/A'}`, 110, yPos);

    // Table Data
    const tableColumn = ["Product", "Condition", "Price", "Quantity", "Total"];
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

    // Generate Table
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos + 15,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }, // Primary blue color
    });

    // Grand Total
    const finalY = doc.lastAutoTable?.finalY || (yPos + 15);
    doc.text(`Grand Total: ${currencyConfig.code} ${calculateGrandTotal()}`, 14, finalY + 10);

    // Save PDF with caseId filename
    doc.save(`${caseId}.pdf`);
};

export default generateQuotation;
