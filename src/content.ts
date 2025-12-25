import { extractAttendanceData } from './data-extractor';
import { calculateMetrics } from './utils';
import { createMetricsOverlay } from './ui';

/**
 * Main content script entry point
 */
function init(): void {
  // Wait for the page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processAttendanceData);
  } else {
    processAttendanceData();
  }

  // Also listen for navigation changes (SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(processAttendanceData, 1000);
    }
  }).observe(document, { subtree: true, childList: true });
}

let updateInterval: number | null = null;
let tableObserver: MutationObserver | null = null;

/**
 * Update the metrics overlay with current data
 */
function updateMetrics(): void {
  const data = extractAttendanceData();
  if (!data || data.rows.length === 0) {
    return;
  }

  try {
    const metrics = calculateMetrics(data.rows, {
      workingHours: data.totals.workingHours,
      offShiftHours: data.totals.offShiftHours,
      overtime: data.totals.overtime,
      nightShift: data.totals.nightShift,
      break: data.totals.break,
    });
    createMetricsOverlay(metrics);
  } catch (error) {
    console.error('Better JOBCAN: Error updating metrics', error);
  }
}

function processAttendanceData(): void {
  // Check if we're on the attendance page
  console.log('Better JOBCAN: Checking URL:', window.location.href);
  if (!window.location.href.includes('/employee/attendance')) {
    console.log('Better JOBCAN: Not on attendance page, skipping');
    // Clear interval and observer if we navigated away
    if (updateInterval !== null) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
    if (tableObserver !== null) {
      tableObserver.disconnect();
      tableObserver = null;
    }
    return;
  }

  console.log('Better JOBCAN: On attendance page, processing...');

  // Clear existing interval and observer if any
  if (updateInterval !== null) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  if (tableObserver !== null) {
    tableObserver.disconnect();
    tableObserver = null;
  }

  // Wait a bit for the table to render
  setTimeout(() => {
    console.log('Better JOBCAN: Attempting to extract data...');
    const data = extractAttendanceData();

    console.log('Better JOBCAN: Extracted data:', data ? `Found ${data.rows.length} rows` : 'null');

    if (!data || data.rows.length === 0) {
      console.warn('Better JOBCAN: Could not extract attendance data, retrying...');
      console.log('Better JOBCAN: Available tables:', document.querySelectorAll('table').length);
      // Retry after a longer delay
      setTimeout(processAttendanceData, 2000);
      return;
    }

    try {
      const metrics = calculateMetrics(data.rows, {
        workingHours: data.totals.workingHours,
        offShiftHours: data.totals.offShiftHours,
        overtime: data.totals.overtime,
        nightShift: data.totals.nightShift,
        break: data.totals.break,
      });
      console.log('Better JOBCAN: Metrics calculated:', metrics);
      createMetricsOverlay(metrics);
      console.log('Better JOBCAN: Overlay created');

      // Find the attendance table to watch for changes
      const attendanceTable = document.querySelector('table[ref="e130"]') ||
        Array.from(document.querySelectorAll('table')).find(t => {
          const text = t.textContent || '';
          return /\d{1,2}\/\d{1,2}\(Mon|Tue|Wed|Thu|Fri|Sat|Sun\)/.test(text) ||
                 (text.includes('Clock-ins') || text.includes('Clock-outs'));
        });

      if (attendanceTable) {
        // Watch for changes in the table (real-time updates)
        tableObserver = new MutationObserver(() => {
          console.log('Better JOBCAN: Table changed, updating metrics...');
          // Debounce updates to avoid too frequent updates
          setTimeout(updateMetrics, 500);
        });

        // Observe changes to the table and its children
        tableObserver.observe(attendanceTable, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: false,
        });

        console.log('Better JOBCAN: Started watching table for changes');
      }

      // Also set up a periodic update as a fallback (every 15 seconds)
      updateInterval = window.setInterval(() => {
        console.log('Better JOBCAN: Periodic update...');
        updateMetrics();
      }, 15000); // Update every 15 seconds
    } catch (error) {
      console.error('Better JOBCAN: Error calculating metrics', error);
    }
  }, 500);
}

// Initialize
console.log('Better JOBCAN: Extension loaded, initializing...');
init();

