export interface AttendanceRow {
  date: string;
  holidayType: string | null;
  shiftTime: string | null;
  clockIn: string | null;
  clockOut: string | null;
  workingHours: string | null;
  offShiftHours: string | null;
  overtime: string | null;
  nightShift: string | null;
  break: string | null;
}

export interface AttendanceData {
  rows: AttendanceRow[];
  totals: {
    workingHours: string;
    offShiftHours: string;
    overtime: string;
    nightShift: string;
    break: string;
  };
}

export interface WorkMetrics {
  overworkTime: number; // in minutes - total overwork this month
  overworkToday: number; // in minutes - overwork today
  hoursRemainingToday: number; // in minutes
  startTimeToday: string | null;
  workingDaysRemaining: number;
  hoursRemainingForQuota: number; // in minutes
  monthlyQuota: number; // in minutes (estimated)
  currentMonthTotal: number; // in minutes
}

