import ExcelJS from "exceljs";
import fs from "fs";
import { graphGet } from "./graphAPI";
import axios from "axios";

let filePath


const getDownloadUrl = async () => {
    try {
        const response = await graphGet(import.meta.env.VITE_ENDPOINT_TO_ROADMAP);
        return response["@microsoft.graph.downloadUrl"];
    } catch (error) {
        console.error('Error getting download URL:', error);
        throw error;
    }
}


export const readFromExcel = async () => {

    try {
        const downloadUrl = await getDownloadUrl();
        const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' })


        const workbook = new ExcelJS.Workbook();

        if (filePath) {
            await workbook.xlsx.readFile(filePath);
        } else {
            await workbook.xlsx.load(response.data);
        }

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
                rowData[header] = cell.type === ExcelJS.ValueType.Formula ? cell.result : cell.value;
            });

            rows.push(rowData);
        });

        return rows;
    } catch (error) {
        console.error('Error reading Excel file:', error);
        throw error;
    }
}