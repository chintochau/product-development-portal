import ExcelJS from "exceljs";
import fs from "fs";

const filePath = "resources/product-roadmap.xlsx";

export const readFromExcel = async () => {

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        const worksheet = workbook.getWorksheet(1); // Access the first worksheet
        const rows = [];

        // Assume the first row contains column headers
        const headers = [];
        worksheet.getRow(1).eachCell((cell) => {
            headers.push(cell.value);
        });

        // Iterate through each row starting from the second row
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip the header row

            const rowData = {};
            row.eachCell((cell, colNumber) => {
                const header = headers[colNumber - 1];
                rowData[header] = cell.value;
            });

            rows.push(rowData);
        });
        return rows;
    } catch (error) {
        console.error('Error reading Excel file:', error);
        throw error;
    }
}