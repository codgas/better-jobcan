import { AttendanceRow, WorkMetrics } from './types';

/**
 * Parse time string (HH:MM) to minutes
 */
export function parseTimeToMinutes(timeStr: string | null): number {
  if (!timeStr || timeStr === '(Available)' || timeStr.trim() === '') {
    return 0;
  }

  const parts = timeStr.split(':');
  if (parts.length !== 2) {
    return 0;
  }

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) {
    return 0;
  }

  return hours * 60 + minutes;
}

/**
 * Format minutes to HH:MM string
 */
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Parse shift time range (e.g., "11:00～16:00") to start and end times
 */
export function parseShiftTime(shiftTime: string | null): { start: number; end: number } | null {
  if (!shiftTime || !shiftTime.includes('～')) {
    return null;
  }

  const [startStr, endStr] = shiftTime.split('～');
  const start = parseTimeToMinutes(startStr.trim());
  const end = parseTimeToMinutes(endStr.trim());

  if (start === 0 || end === 0) {
    return null;
  }

  return { start, end };
}

/**
 * Get today's date string in format MM/DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${month}/${day}`;
}

/**
 * Get current time in minutes since midnight
 */
export function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Check if a date string matches today
 */
export function isToday(dateStr: string): boolean {
  const today = getTodayDateString();
  return dateStr.startsWith(today);
}

/**
 * Count working days remaining in the month (excluding weekends and holidays)
 */
export function getWorkingDaysRemaining(rows: AttendanceRow[]): number {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const todayDate = today.getDate();

  // Get last day of month
  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

  let workingDays = 0;

  // Start from tomorrow (todayDate + 1) and count until end of month
  for (let day = todayDate + 1; day <= lastDay; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay();

    // Skip weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }

    // Check if it's a holiday by looking at the row data
    // Format: MM/DD(Mon) -> we need to match MM/DD
    const monthStr = (currentMonth + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const datePattern = `${monthStr}/${dayStr}`;

    // Find row that starts with this date pattern
    const row = rows.find(r => {
      // Row date format is like "12/19(Fri)" or "12/20(Sat)"
      return r.date.startsWith(datePattern);
    });

    // If row exists and has a holiday type, skip it
    if (row && row.holidayType && row.holidayType.trim() !== '') {
      continue; // Skip holidays
    }

    workingDays++;
  }

  console.log('Better JOBCAN: Working days remaining calculation:', {
    today: `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${todayDate.toString().padStart(2, '0')}`,
    lastDay,
    workingDaysRemaining: workingDays
  });

  return workingDays;
}

/**
 * Calculate work metrics from attendance data
 */
export function calculateMetrics(
  rows: AttendanceRow[],
  totals: { workingHours: string; offShiftHours: string; overtime: string; nightShift: string; break: string }
): WorkMetrics {
  const todayRow = rows.find(row => isToday(row.date));

  // Calculate total overwork this month
  // Sum up overwork from all individual days (working hours - 8 hours for each day)
  const standardWorkDayMinutes = 8 * 60;
  let overworkTime = 0;
  for (const row of rows) {
    if (row.workingHours && !row.holidayType) {
      const workingMinutes = parseTimeToMinutes(row.workingHours);
      // Overwork = working hours - 8 hours (if positive)
      if (workingMinutes > standardWorkDayMinutes) {
        overworkTime += (workingMinutes - standardWorkDayMinutes);
      }
    }
  }

  // Also add any overtime from totals
  const totalOvertimeMinutes = parseTimeToMinutes(totals.overtime || '00:00');
  overworkTime += totalOvertimeMinutes;

  console.log('Better JOBCAN: Total overwork calculation:', {
    calculatedFromRows: true,
    overtime: totals.overtime,
    overtimeMinutes: totalOvertimeMinutes,
    totalOverworkMinutes: overworkTime,
    totalOverworkFormatted: formatMinutesToTime(overworkTime)
  });

  // Calculate today's overwork
  // Overwork = working hours - 8 hours (standard work day)
  let overworkToday = 0;
  if (todayRow) {
    if (todayRow.workingHours) {
      const workingMinutes = parseTimeToMinutes(todayRow.workingHours);
      // Standard work day is 8 hours
      const standardWorkDayMinutes = 8 * 60;
      // Overwork = working hours - 8 hours (if positive)
      overworkToday = Math.max(0, workingMinutes - standardWorkDayMinutes);
    } else if (todayRow.clockIn) {
      // If no working hours yet, calculate from clock times
      const clockIn = parseTimeToMinutes(todayRow.clockIn);
      const clockOut = todayRow.clockOut && todayRow.clockOut !== '(Available)' && todayRow.clockOut.trim() !== ''
        ? parseTimeToMinutes(todayRow.clockOut)
        : null;

      if (clockIn > 0) {
        const currentTime = clockOut !== null ? clockOut : getCurrentTimeMinutes();
        const workedMinutes = currentTime - clockIn;
        const standardWorkDayMinutes = 8 * 60;
        overworkToday = Math.max(0, workedMinutes - standardWorkDayMinutes);
      }
    }
  }

  console.log('Better JOBCAN: Overwork today calculation:', {
    todayRow: todayRow ? {
      date: todayRow.date,
      offShiftHours: todayRow.offShiftHours,
      workingHours: todayRow.workingHours,
      shiftTime: todayRow.shiftTime,
      clockIn: todayRow.clockIn,
      clockOut: todayRow.clockOut,
      overtime: todayRow.overtime
    } : null,
    overworkTodayMinutes: overworkToday,
    overworkTodayFormatted: formatMinutesToTime(overworkToday),
    calculationMethod: todayRow?.offShiftHours ? 'from table offShiftHours' :
                      todayRow?.workingHours ? 'calculated from workingHours' :
                      todayRow?.clockIn ? 'calculated from clock times' : 'none'
  });

  // Get today's start time
  const startTimeToday = todayRow?.clockIn || null;

  // Calculate hours remaining today
  // This calculates how many hours are still needed to complete 8 hours of work today
  // Use "Working Hours" from the table if available (accounts for breaks), otherwise calculate from clock times
  let hoursRemainingToday = 0;
  if (todayRow) {
    // Standard work day is 8 hours (480 minutes)
    const standardWorkDayMinutes = 8 * 60;

    // First, try to use "Working Hours" from the table (this accounts for breaks)
    if (todayRow.workingHours) {
      const workedMinutes = parseTimeToMinutes(todayRow.workingHours);

      // Calculate remaining time to complete 8 hours
      if (workedMinutes < standardWorkDayMinutes) {
        hoursRemainingToday = standardWorkDayMinutes - workedMinutes;
      } else {
        // Already worked 8+ hours
        hoursRemainingToday = 0;
      }

      console.log('Better JOBCAN: Hours remaining today calculation (using Working Hours):', {
        workingHours: todayRow.workingHours,
        workedMinutes: formatMinutesToTime(workedMinutes),
        standardWorkDay: formatMinutesToTime(standardWorkDayMinutes),
        hoursRemaining: formatMinutesToTime(hoursRemainingToday)
      });
    }
    // If no working hours yet, calculate from clock-in/clock-out times
    else if (todayRow.clockIn) {
      const clockIn = parseTimeToMinutes(todayRow.clockIn);
      const clockOut = todayRow.clockOut && todayRow.clockOut !== '(Available)' && todayRow.clockOut.trim() !== ''
        ? parseTimeToMinutes(todayRow.clockOut)
        : null;

      if (clockIn > 0) {
        // Current time: if clocked out, use that; otherwise use current time
        const currentTime = clockOut !== null ? clockOut : getCurrentTimeMinutes();

        // Calculate how long they've worked today (raw time, without breaks)
        const workedMinutes = currentTime - clockIn;

        // Calculate remaining time to complete 8 hours
        if (workedMinutes < standardWorkDayMinutes) {
          hoursRemainingToday = standardWorkDayMinutes - workedMinutes;
        } else {
          // Already worked 8+ hours
          hoursRemainingToday = 0;
        }

        console.log('Better JOBCAN: Hours remaining today calculation (using clock times):', {
          clockIn: todayRow.clockIn,
          clockOut: todayRow.clockOut,
          currentTime: formatMinutesToTime(currentTime),
          workedMinutes: formatMinutesToTime(workedMinutes),
          standardWorkDay: formatMinutesToTime(standardWorkDayMinutes),
          hoursRemaining: formatMinutesToTime(hoursRemainingToday)
        });
      }
    } else {
      console.log('Better JOBCAN: No clock-in time or working hours found for today');
    }
  } else {
    console.log('Better JOBCAN: No today row found');
  }

  // Calculate working days remaining
  const workingDaysRemaining = getWorkingDaysRemaining(rows);

  // Estimate monthly quota (assuming 8 hours per working day)
  // Count total working days in the month (excluding weekends and holidays)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  let totalWorkingDaysInMonth = 0;
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay();

    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }

    // Check if it's a holiday
    const monthStr = (currentMonth + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const datePattern = `${monthStr}/${dayStr}`;
    const row = rows.find(r => r.date.startsWith(datePattern));

    // If row exists and has a holiday type, skip it
    if (row && row.holidayType && row.holidayType.trim() !== '') {
      continue; // Skip holidays
    }

    totalWorkingDaysInMonth++;
  }

  const monthlyQuota = totalWorkingDaysInMonth * 8 * 60; // 8 hours per day in minutes

  console.log('Better JOBCAN: Monthly quota calculation:', {
    totalWorkingDaysInMonth,
    monthlyQuotaHours: monthlyQuota / 60,
    monthlyQuotaFormatted: formatMinutesToTime(monthlyQuota)
  });

  // Extract totals - working hours is the actual hours worked
  const totalWorkingHours = parseTimeToMinutes(totals.workingHours || '00:00');
  const totalOffShiftHours = parseTimeToMinutes(totals.offShiftHours || '00:00');

  // Current month total is the working hours (this is what counts toward quota)
  // Off-shift hours are overtime/overwork, not counted in monthly quota
  const currentMonthTotal = totalWorkingHours;

  // Calculate hours remaining for quota
  // Monthly quota is based on regular working hours only (8 hours per working day)
  const hoursRemainingForQuota = Math.max(0, monthlyQuota - totalWorkingHours);

  console.log('Better JOBCAN: Calculation details:', {
    totalWorkingHours: formatMinutesToTime(totalWorkingHours),
    totalOffShiftHours: formatMinutesToTime(totalOffShiftHours),
    monthlyQuota: formatMinutesToTime(monthlyQuota),
    currentMonthTotal: formatMinutesToTime(currentMonthTotal),
    hoursRemainingForQuota: formatMinutesToTime(hoursRemainingForQuota),
    workingDaysRemaining
  });

  return {
    overworkTime,
    overworkToday,
    hoursRemainingToday,
    startTimeToday,
    workingDaysRemaining,
    hoursRemainingForQuota,
    monthlyQuota,
    currentMonthTotal,
  };
}

