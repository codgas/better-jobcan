import { AttendanceRow, AttendanceData } from './types';

/**
 * Extract attendance data from the JOBCAN attendance table
 */
export function extractAttendanceData(): AttendanceData | null {
  // Find the table with daily attendance rows (has dates like 12/01(Mon))
  // Check all tables and find the one with date rows
  const allTables = Array.from(document.querySelectorAll('table'));
  let table: HTMLTableElement | null = null;

  // First try the specific selector
  table = document.querySelector('table[ref="e130"]') as HTMLTableElement;

  // If not found, search all tables for one with date rows
  if (!table) {
    for (const t of allTables) {
      const rows = Array.from(t.querySelectorAll('tr'));
      // Check if this table has rows with date patterns like "12/01(Mon)"
      const hasDateRows = rows.some(row => {
        const text = row.textContent || '';
        return /\d{1,2}\/\d{1,2}\(Mon|Tue|Wed|Thu|Fri|Sat|Sun\)/.test(text);
      });

      if (hasDateRows) {
        console.log('Better JOBCAN: Found table with date rows');
        table = t as HTMLTableElement;
        break;
      }
    }
  }

  // If still not found, try finding by column headers
  if (!table) {
    table = allTables.find(t => {
      const text = t.textContent || '';
      return (text.includes('Clock-ins') || text.includes('Clock-outs')) &&
             (text.includes('Date') || /\d{1,2}\/\d{1,2}/.test(text));
    }) as HTMLTableElement || null;
  }

  if (!table) {
    console.warn('Better JOBCAN: Could not find attendance table');
    console.log('Better JOBCAN: Available tables:', allTables.length);

    // Log details about each table to help debug
    allTables.forEach((t, i) => {
      const text = t.textContent || '';
      const rows = Array.from(t.querySelectorAll('tr'));
      const hasDatePattern = /\d{1,2}\/\d{1,2}\(Mon|Tue|Wed|Thu|Fri|Sat|Sun\)/.test(text);
      const dateRows = rows.filter(r => /\d{1,2}\/\d{1,2}\(Mon|Tue|Wed|Thu|Fri|Sat|Sun\)/.test(r.textContent || ''));

      console.log(`Better JOBCAN: Table ${i}:`, {
        hasClockIns: text.includes('Clock-ins') || text.includes('Clock-in'),
        hasWorkingHours: text.includes('Working Hours'),
        hasDatePattern: hasDatePattern,
        dateRowCount: dateRows.length,
        rowCount: rows.length,
        firstFewChars: text.substring(0, 150),
        sampleRows: rows.slice(0, 3).map(r => r.textContent?.substring(0, 80))
      });
    });

    return null;
  }

  console.log('Better JOBCAN: Found attendance table');

  const rows: AttendanceRow[] = [];

  // Find all table rows
  const allRows = Array.from(table.querySelectorAll('tr'));

  // Find header row to understand column structure
  console.log('Better JOBCAN: Searching for header row in', allRows.length, 'rows');
  const headerRow = allRows.find(row => {
    const text = row.textContent || '';
    const hasClockIns = text.includes('Clock-ins') || text.includes('Clock-in') || text.includes('Clock');
    const hasWorkingHours = text.includes('Working Hours') || text.includes('Working');
    if (hasClockIns || hasWorkingHours) {
      console.log('Better JOBCAN: Found potential header row:', text.substring(0, 150));
    }
    return hasClockIns || hasWorkingHours;
  });

  if (!headerRow) {
    console.warn('Better JOBCAN: Could not find header row');
    console.log('Better JOBCAN: All rows:', allRows.length);
    allRows.slice(0, 5).forEach((row, i) => {
      const text = row.textContent || '';
      console.log(`Better JOBCAN: Row ${i}:`, {
        text: text.substring(0, 150),
        cells: row.querySelectorAll('td, th').length
      });
    });
    return null;
  }

  console.log('Better JOBCAN: Found header row');

  // Get data rows (skip header and total rows)
  console.log('Better JOBCAN: Analyzing rows between header and total...');
  const dataRows = allRows.filter((row, index) => {
    if (row === headerRow) {
      console.log('Better JOBCAN: Skipping header row at index', index);
      return false;
    }
    const text = row.textContent?.trim() || '';
    if (text.includes('Total') || text.includes('合計')) {
      console.log('Better JOBCAN: Skipping total row at index', index);
      return false;
    }

    // Log all rows that aren't header or total to see what they contain
    const cells = row.querySelectorAll('td, th');
    console.log(`Better JOBCAN: Row ${index}:`, {
      text: text.substring(0, 100),
      cellCount: cells.length,
      firstCell: cells[0]?.textContent?.trim()?.substring(0, 30),
      hasDatePattern: /\d{2}\/\d{2}/.test(text),
      hasDatePatternAlt: /\d{1,2}\/\d{1,2}/.test(text)
    });

    // Check if it looks like a data row (has date pattern like MM/DD or M/D)
    const hasDatePattern = /\d{1,2}\/\d{1,2}/.test(text);
    if (hasDatePattern) {
      console.log('Better JOBCAN: ✓ Found data row at index', index, ':', text.substring(0, 80));
    }
    return hasDatePattern;
  });

  console.log('Better JOBCAN: Filtered data rows:', dataRows.length);

  for (const row of dataRows) {
    const cells = Array.from(row.querySelectorAll('td, th'));

    if (cells.length < 5) {
      continue;
    }

    // Extract data from cells
    // Column order: Date, Holiday Type, Shift Time, Clock-in, Clock-out, Working Hours, Off-shift, Overtime, Night Shift, Break
    const dateCell = cells[0];
    const holidayCell = cells[1];
    const shiftCell = cells[2];
    const clockInCell = cells[3];
    const clockOutCell = cells[4];
    const workingHoursCell = cells[5];
    const offShiftCell = cells[6];
    const overtimeCell = cells[7];
    const nightShiftCell = cells[8];
    const breakCell = cells[9];

    const date = dateCell?.textContent?.trim() || '';
    const holidayType = holidayCell?.textContent?.trim() || null;
    const shiftTime = shiftCell?.textContent?.trim() || null;
    const clockIn = clockInCell?.textContent?.trim() || null;
    const clockOut = clockOutCell?.textContent?.trim() || null;
    const workingHours = workingHoursCell?.textContent?.trim() || null;
    const offShiftHours = offShiftCell?.textContent?.trim() || null;
    const overtime = overtimeCell?.textContent?.trim() || null;
    const nightShift = nightShiftCell?.textContent?.trim() || null;
    const breakTime = breakCell?.textContent?.trim() || null;

    // Skip empty rows or rows without date
    if (!date || !/\d{2}\/\d{2}/.test(date)) {
      continue;
    }

    rows.push({
      date,
      holidayType: holidayType && holidayType !== '' && !holidayType.match(/^\s*$/) ? holidayType : null,
      shiftTime: shiftTime && shiftTime !== '' && !shiftTime.match(/^\s*$/) ? shiftTime : null,
      clockIn: clockIn && clockIn !== '' && !clockIn.match(/^\s*$/) ? clockIn : null,
      clockOut: clockOut && clockOut !== '' && !clockOut.match(/^\s*$/) ? clockOut : null,
      workingHours: workingHours && workingHours !== '' && !workingHours.match(/^\s*$/) ? workingHours : null,
      offShiftHours: offShiftHours && offShiftHours !== '' && !offShiftHours.match(/^\s*$/) ? offShiftHours : null,
      overtime: overtime && overtime !== '' && !overtime.match(/^\s*$/) ? overtime : null,
      nightShift: nightShift && nightShift !== '' && !nightShift.match(/^\s*$/) ? nightShift : null,
      break: breakTime && breakTime !== '' && !breakTime.match(/^\s*$/) ? breakTime : null,
    });
  }

  // Extract totals from the Total row
  const totalRow = allRows.find(row => {
    const text = row.textContent?.trim() || '';
    return text.includes('Total') || text.includes('合計');
  });

  let totals = {
    workingHours: '00:00',
    offShiftHours: '00:00',
    overtime: '00:00',
    nightShift: '00:00',
    break: '00:00',
  };

  if (totalRow) {
    const totalCells = Array.from(totalRow.querySelectorAll('td, th'));
    const cellTexts = totalCells.map(c => c.textContent?.trim() || '');
    console.log('Better JOBCAN: Total row cells:', totalCells.length, cellTexts);

    // Based on the log: ['Total', '', '', '', '127:38', '67:38', '00:00', '00:00', '15:00', '']
    // Column order: Date(Total), Holiday Type(empty), Shift Time(empty), Clock-in(empty), Clock-out(empty),
    //                Working Hours(127:38), Off-shift(67:38), Overtime(00:00), Night Shift(00:00), Break(15:00)
    // So: cells[4] = Working Hours, cells[5] = Off-shift, cells[6] = Overtime, cells[7] = Night Shift, cells[8] = Break

    if (totalCells.length >= 9) {
      totals = {
        workingHours: cellTexts[4] || '00:00',
        offShiftHours: cellTexts[5] || '00:00',
        overtime: cellTexts[6] || '00:00',
        nightShift: cellTexts[7] || '00:00',
        break: cellTexts[8] || '00:00',
      };
    } else if (totalCells.length >= 5) {
      // Fallback: try to find by looking for time patterns
      let workingHours = '00:00';
      let offShiftHours = '00:00';
      let overtime = '00:00';
      let nightShift = '00:00';
      let breakTime = '00:00';

      // Look for cells with time patterns (HH:MM)
      cellTexts.forEach((text, idx) => {
        if (/\d{1,2}:\d{2}/.test(text)) {
          // First time pattern is usually working hours, second is off-shift
          if (workingHours === '00:00') {
            workingHours = text;
          } else if (offShiftHours === '00:00') {
            offShiftHours = text;
          } else if (overtime === '00:00') {
            overtime = text;
          } else if (nightShift === '00:00') {
            nightShift = text;
          } else if (breakTime === '00:00') {
            breakTime = text;
          }
        }
      });

      totals = {
        workingHours,
        offShiftHours,
        overtime,
        nightShift,
        break: breakTime,
      };
    }

    console.log('Better JOBCAN: Extracted totals:', totals);
  }

  console.log('Better JOBCAN: Extracted rows:', rows.length);
  console.log('Better JOBCAN: Totals:', totals);

  return {
    rows,
    totals,
  };
}

