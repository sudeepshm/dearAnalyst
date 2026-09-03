import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

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
      const rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (!rawData || rawData.length === 0) {
        sheets[name] = {
          name,
          columns: [],
          columnTypes: {},
          totalRows: 0,
          data: [],
          preview: [],
        };
        return;
      }

      const columns = Object.keys(rawData[0]);
      const columnTypes = {};

      columns.forEach((col) => {
        const sampleVals = rawData.slice(0, 25).map((r) => r[col]).filter((v) => v !== '' && v !== null && v !== undefined);
        const isAllNumbers = sampleVals.length > 0 && sampleVals.every((v) => !isNaN(Number(v)));
        const isLikelyDate = sampleVals.length > 0 && sampleVals.every((v) => {
          if (v instanceof Date) return true;
          const parsed = Date.parse(v);
          return !isNaN(parsed) && String(v).length >= 4;
        });

        if (isAllNumbers) {
          columnTypes[col] = 'number';
        } else if (isLikelyDate) {
          columnTypes[col] = 'date';
        } else {
          columnTypes[col] = 'string';
        }
      });

      sheets[name] = {
        name,
        columns,
        columnTypes,
        totalRows: rawData.length,
        data: rawData,
        preview: rawData.slice(0, 10),
      };

      if (!firstValidSheet) {
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
    });
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return NextResponse.json(
      { error: 'Failed to parse Excel file: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
