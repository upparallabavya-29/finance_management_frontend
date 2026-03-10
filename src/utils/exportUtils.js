/**
 * Utility to export data to CSV
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file
 */
export const exportToCSV = (data, filename) => {
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(header => {
                const val = row[header];
                const escaped = ('' + val).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',')
        )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Utility for basic PDF generation
 * Note: Requires jspdf to be installed if using advanced features.
 * For now, we'll implement a clean print-view based export or simple PDF mock.
 */
export const exportToPDF = (elementId, filename) => {
    // In a real production app, we'd use jspdf and html2canvas.
    // Here we will trigger the browser's print dialog with specific styles for PDF saving.
    const originalTitle = document.title;
    document.title = filename;
    window.print();
    document.title = originalTitle;
};
