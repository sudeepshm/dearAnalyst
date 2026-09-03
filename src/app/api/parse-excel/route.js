import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { parseSheetWithHeaderDetection, pivotFinancialDataset } from '@/utils/excelPivoter';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Read the workbook
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheetNames = workbook.SheetNames;

    if (!sheetNames || sheetNames.length === 0) {
      return NextResponse.json({ error: 'Excel file contains no worksheets' }, { status: 400 });
    }

    const sheets = {};
    let firstValidSheet = null;

    sheetNames.forEach((name) => {
      const sheet = workbook.Sheets[name];
      const parsed = parseSheetWithHeaderDetection(sheet);
      const pivoted = pivotFinancialDataset(parsed.rawData, parsed.columns, parsed.columnTypes);

      const isFinancial = pivoted.isFinancial;
      const defaultOrientation = isFinancial ? 'transposed' : 'standard';

      sheets[name] = {
        name,
        // Standard Tabular Orientation
        standard: {
          columns: parsed.columns,
          columnTypes: parsed.columnTypes,
          totalRows: parsed.rawData.length,
          data: parsed.rawData,
          preview: parsed.rawData.slice(0, 10),
        },
        // Transposed Financial Statement Orientation
        transposed: {
          isFinancial: pivoted.isFinancial,
          columns: pivoted.columns,
          columnTypes: pivoted.columnTypes,
          totalRows: pivoted.data.length,
          data: pivoted.data,
          preview: pivoted.data.slice(0, 10),
          descriptorColumn: pivoted.descriptorColumn,
          periodColumns: pivoted.periodColumns,
        },
        // Active configuration (defaults based on whether it is financial)
        isFinancial,
        defaultOrientation,
        orientation: defaultOrientation,
        columns: isFinancial ? pivoted.columns : parsed.columns,
        columnTypes: isFinancial ? pivoted.columnTypes : parsed.columnTypes,
        totalRows: isFinancial ? pivoted.data.length : parsed.rawData.length,
        data: isFinancial ? pivoted.data : parsed.rawData,
        preview: (isFinancial ? pivoted.data : parsed.rawData).slice(0, 10),
        descriptorColumn: pivoted.descriptorColumn || '',
      };

      if (!firstValidSheet && parsed.rawData.length > 0) {
        firstValidSheet = name;
      }
    });

    const activeSheetName = firstValidSheet || sheetNames[0];
    const primary = sheets[activeSheetName];

    return NextResponse.json({
      success: true,
      fileName: file.name,
      sheetNames,
      activeSheet: activeSheetName,
      sheets,
      // Backward compatibility aliases
      columns: primary?.columns || [],
      columnTypes: primary?.columnTypes || {},
      totalRows: primary?.totalRows || 0,
      data: primary?.data || [],
      preview: primary?.preview || [],
      isFinancial: primary?.isFinancial || false,
      defaultOrientation: primary?.defaultOrientation || 'standard',
    });
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return NextResponse.json(
      { error: 'Failed to parse Excel file: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
