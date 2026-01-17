import { useState } from 'react';
import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { toast } from 'sonner';

export interface ParsedData {
  headers: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  summary: string;
  fileName: string;
  fileType: 'csv' | 'excel';
}

export function useFileParser() {
  const [parsing, setParsing] = useState(false);

  const parseCSV = async (file: File): Promise<{ headers: string[]; rows: Record<string, unknown>[] } | null> => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('CSV parsing errors:', results.errors);
          }
          
          if (!results.data || results.data.length === 0) {
            resolve(null);
            return;
          }

          const headers = results.meta.fields || [];
          const rows = results.data as Record<string, unknown>[];
          
          resolve({ headers, rows });
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          resolve(null);
        }
      });
    });
  };

  const parseExcel = async (file: File): Promise<{ headers: string[]; rows: Record<string, unknown>[] } | null> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      
      // Get the first worksheet
      const worksheet = workbook.worksheets[0];
      if (!worksheet || worksheet.rowCount < 2) {
        return null;
      }

      // Extract headers from first row
      const headerRow = worksheet.getRow(1);
      const headers: string[] = [];
      headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        headers[colNumber - 1] = String(cell.value || '').trim();
      });

      // Extract data rows
      const rows: Record<string, unknown>[] = [];
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const rowObj: Record<string, unknown> = {};
        let hasData = false;
        
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header) {
            let value: unknown = cell.value;
            
            // Handle ExcelJS cell value types
            if (value && typeof value === 'object') {
              const cellValue = value as Record<string, unknown>;
              if ('result' in cellValue) {
                // Formula result
                value = cellValue.result;
              } else if ('richText' in cellValue && Array.isArray(cellValue.richText)) {
                // Rich text - combine all text parts
                value = (cellValue.richText as Array<{ text: string }>).map(rt => rt.text).join('');
              } else if ('hyperlink' in cellValue) {
                // Hyperlink - use text if available, otherwise hyperlink
                value = cellValue.text || cellValue.hyperlink;
              }
            }
            
            rowObj[header] = value;
            if (value !== null && value !== undefined && value !== '') {
              hasData = true;
            }
          }
        });
        
        if (hasData) {
          rows.push(rowObj);
        }
      }

      return { headers: headers.filter(h => h), rows };
    } catch (error) {
      console.error('Excel parsing error:', error);
      return null;
    }
  };

  const parseFile = async (file: File): Promise<ParsedData | null> => {
    setParsing(true);
    
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isCSV = fileExtension === 'csv';
      const isExcel = ['xlsx', 'xls'].includes(fileExtension || '');

      if (!isCSV && !isExcel) {
        toast.error('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
        return null;
      }

      let result: { headers: string[]; rows: Record<string, unknown>[] } | null = null;

      if (isCSV) {
        result = await parseCSV(file);
      } else {
        result = await parseExcel(file);
      }

      if (!result || result.rows.length === 0) {
        toast.error('File appears to be empty or has no data rows');
        return null;
      }

      const { headers, rows } = result;

      // Generate auto-summary based on data
      const summary = generateDataSummary(headers, rows);

      return {
        headers,
        rows,
        rowCount: rows.length,
        summary,
        fileName: file.name,
        fileType: isCSV ? 'csv' : 'excel',
      };
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Failed to parse file. Please ensure it\'s a valid CSV or Excel file.');
      return null;
    } finally {
      setParsing(false);
    }
  };

  return { parseFile, parsing };
}

function generateDataSummary(headers: string[], rows: Record<string, unknown>[]): string {
  const columnCount = headers.length;
  const rowCount = rows.length;
  
  // Analyze column types
  const columnAnalysis: string[] = [];
  
  headers.slice(0, 5).forEach(header => {
    const values = rows.map(row => row[header]).filter(v => v !== null && v !== undefined);
    const sampleValues = values.slice(0, 10);
    
    // Detect type
    const numericCount = sampleValues.filter(v => typeof v === 'number' || !isNaN(Number(v))).length;
    const isNumeric = numericCount > sampleValues.length * 0.8;
    
    if (isNumeric && values.length > 0) {
      const numericValues = values
        .map(v => typeof v === 'number' ? v : parseFloat(String(v)))
        .filter(v => !isNaN(v));
      
      if (numericValues.length > 0) {
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        columnAnalysis.push(`${header}: numeric (range ${formatNumber(min)}-${formatNumber(max)}, avg ${formatNumber(avg)})`);
      }
    } else {
      const uniqueCount = new Set(values.map(v => String(v))).size;
      columnAnalysis.push(`${header}: categorical (${uniqueCount} unique values)`);
    }
  });

  const moreColumns = columnCount > 5 ? ` and ${columnCount - 5} more columns` : '';
  
  return `Dataset contains ${rowCount} records with ${columnCount} columns. Column analysis: ${columnAnalysis.join('; ')}${moreColumns}.`;
}

function formatNumber(num: number): string {
  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else if (Number.isInteger(num)) {
    return num.toString();
  } else {
    return num.toFixed(2);
  }
}
