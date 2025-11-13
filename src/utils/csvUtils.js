/**
 * CSV Utility Functions
 * Handles CSV download functionality
 */

/**
 * Downloads CSV content as a file
 * @param {string} csvContent - CSV content as string
 * @param {string} filename - Optional filename (defaults to timestamp-based name)
 */
export const downloadCSV = (csvContent, filename = null) => {
  if (!csvContent || typeof csvContent !== 'string') {
    console.error('❌ [CSV] Invalid CSV content provided');
    return;
  }

  // Generate filename if not provided
  if (!filename) {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/T/, '_')
      .replace(/\..+/, '')
      .replace(/:/g, '-');
    filename = `export_${timestamp}.csv`;
  }

  // Ensure filename ends with .csv
  if (!filename.endsWith('.csv')) {
    filename = `${filename}.csv`;
  }

  try {
    // Create Blob with CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL object
    URL.revokeObjectURL(url);
    
    console.log('✅ [CSV] CSV file downloaded:', filename);
  } catch (error) {
    console.error('❌ [CSV] Error downloading CSV:', error);
    throw new Error(`Failed to download CSV: ${error.message}`);
  }
};

/**
 * Validates CSV content format
 * @param {string} csvContent - CSV content to validate
 * @returns {boolean} True if CSV appears valid
 */
export const validateCSV = (csvContent) => {
  if (!csvContent || typeof csvContent !== 'string') {
    return false;
  }
  
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    return false; // Need at least header + 1 data row
  }
  
  // Check if first line has commas (header)
  const header = lines[0];
  if (!header.includes(',')) {
    return false;
  }
  
  return true;
};

/**
 * Parses CSV content into table format (tableColumns and tableData)
 * @param {string} csvContent - CSV content as string
 * @returns {Object|null} Object with tableColumns and tableData, or null if invalid
 */
export const parseCSVToTable = (csvContent) => {
  if (!csvContent || typeof csvContent !== 'string') {
    return null;
  }
  
  const lines = csvContent.trim().split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return null; // Need at least header + 1 data row
  }
  
  // Parse header row
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim());
  
  if (headers.length === 0) {
    return null;
  }
  
  // Create tableColumns from headers
  const tableColumns = headers.map((header, index) => ({
    key: `col_${index}`,
    label: header
  }));
  
  // Parse data rows
  const tableData = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(',').map(v => v.trim());
    
    // Create row object with column keys
    const row = {};
    headers.forEach((header, index) => {
      row[`col_${index}`] = values[index] || '';
    });
    
    tableData.push(row);
  }
  
  return {
    tableColumns,
    tableData
  };
};

/**
 * Removes JSON markdown code blocks from text
 * @param {string} text - Text that may contain JSON code blocks
 * @returns {string} Text with JSON code blocks removed
 */
export const removeJSONFromText = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  // Remove JSON code blocks (```json ... ```)
  let cleanedText = text.replace(/```json\s*\n[\s\S]*?```/g, '');
  
  // Also remove CSV code blocks if any (legacy support)
  cleanedText = cleanedText.replace(/```(?:csv|text)?\s*\n[\s\S]*?```/g, '');
  
  // Clean up multiple consecutive newlines
  cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');
  
  // Remove "CSV Data" or "JSON Data" headers if present
  cleanedText = cleanedText.replace(/^#*\s*(CSV|JSON)\s+Data\s*$/gmi, '');
  cleanedText = cleanedText.replace(/^##*\s*(CSV|JSON)\s+Data\s*$/gmi, '');
  
  return cleanedText.trim();
};

/**
 * Converts JSON table structure to tableColumns and tableData format
 * @param {Object} jsonTable - Object with columns array and rows array
 * @returns {Object|null} Object with tableColumns and tableData, or null if invalid
 */
export const parseJSONToTable = (jsonTable) => {
  if (!jsonTable || !jsonTable.columns || !jsonTable.rows) {
    return null;
  }
  
  const columns = jsonTable.columns;
  const rows = jsonTable.rows;
  
  if (columns.length === 0 || rows.length === 0) {
    return null;
  }
  
  // Create tableColumns from JSON columns
  const tableColumns = columns.map((column, index) => ({
    key: `col_${index}`,
    label: column
  }));
  
  // Create tableData from JSON rows
  const tableData = rows.map((row) => {
    const rowObj = {};
    columns.forEach((column, index) => {
      rowObj[`col_${index}`] = row[column] || '';
    });
    return rowObj;
  });
  
  return {
    tableColumns,
    tableData
  };
};

/**
 * Converts JSON table structure to CSV string
 * @param {Object} jsonTable - Object with columns array and rows array
 * @returns {string|null} CSV string or null if invalid
 */
export const convertJSONToCSV = (jsonTable) => {
  if (!jsonTable || !jsonTable.columns || !jsonTable.rows) {
    return null;
  }
  
  const columns = jsonTable.columns;
  const rows = jsonTable.rows;
  
  if (columns.length === 0 || rows.length === 0) {
    return null;
  }
  
  // Create CSV header
  const csvLines = [columns.join(',')];
  
  // Create CSV rows
  for (const row of rows) {
    const values = columns.map(col => {
      const value = row[col] || '';
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    });
    csvLines.push(values.join(','));
  }
  
  return csvLines.join('\n');
};

