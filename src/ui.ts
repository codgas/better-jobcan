import { WorkMetrics } from './types';
import { formatMinutesToTime } from './utils';

let overlayElement: HTMLElement | null = null;
let isInitialLoad = true;

/**
 * Create and display the metrics overlay
 */
export function createMetricsOverlay(metrics: WorkMetrics): void {
  // If overlay exists, update it instead of recreating to avoid pop-in
  if (overlayElement) {
    updateOverlayContent(overlayElement, metrics);
    return;
  }

  overlayElement = document.createElement('div');
  overlayElement.id = 'better-jobcan-overlay';
  overlayElement.className = 'better-jobcan-overlay';

  // Only animate on initial load
  if (isInitialLoad) {
    overlayElement.classList.add('initial-load');
    isInitialLoad = false;
  }

  const overworkTodayClass = metrics.overworkToday > 0 ? 'positive' : 'neutral';
  const overworkTotalClass = metrics.overworkTime > 0 ? 'positive' : 'neutral';
  const remainingClass = metrics.hoursRemainingToday > 0 ? 'warning' : 'success';

  overlayElement.innerHTML = `
    <div class="better-jobcan-header">
      <h3>📊 Better JOBCAN Status</h3>
      <button class="better-jobcan-close" id="better-jobcan-close">×</button>
    </div>
    <div class="better-jobcan-content">
      <div class="better-jobcan-metric">
        <div class="metric-label">Overwork Today</div>
        <div class="metric-value ${overworkTodayClass}">${formatMinutesToTime(metrics.overworkToday)}</div>
      </div>

      <div class="better-jobcan-metric">
        <div class="metric-label">Total Overwork This Month</div>
        <div class="metric-value ${overworkTotalClass}">${formatMinutesToTime(metrics.overworkTime)}</div>
      </div>

      <div class="better-jobcan-metric">
        <div class="metric-label">Hours Remaining Today</div>
        <div class="metric-value ${remainingClass}">${formatMinutesToTime(metrics.hoursRemainingToday)}</div>
      </div>

      <div class="better-jobcan-metric">
        <div class="metric-label">Start Time Today</div>
        <div class="metric-value">${metrics.startTimeToday || 'Not started'}</div>
      </div>

      <div class="better-jobcan-metric">
        <div class="metric-label">Working Days Remaining</div>
        <div class="metric-value">${metrics.workingDaysRemaining}</div>
        <div style="font-size: 14px; opacity: 0.8; margin-top: 4px;">days</div>
      </div>

      <div class="better-jobcan-metric">
        <div class="metric-label">Hours Remaining for Monthly Quota</div>
        <div class="metric-value ${metrics.hoursRemainingForQuota > 0 ? 'warning' : 'success'}">
          ${formatMinutesToTime(metrics.hoursRemainingForQuota)}
        </div>
      </div>

      <div class="better-jobcan-metric">
        <div class="metric-label">Monthly Progress</div>
        <div class="metric-value" style="font-size: 22px;">
          ${formatMinutesToTime(metrics.currentMonthTotal)} / ${formatMinutesToTime(metrics.monthlyQuota)}
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${metrics.monthlyQuota > 0 ? Math.min(100, (metrics.currentMonthTotal / metrics.monthlyQuota) * 100) : 0}%"></div>
        </div>
      </div>
    </div>
  `;

  // Overlay is fixed positioned, so we don't need to insert it into the DOM flow
  // Just append to body so it doesn't interfere with page layout
  document.body.appendChild(overlayElement);
  console.log('Better JOBCAN: Overlay appended to body (fixed position)');

  // Add close button handler
  const closeButton = overlayElement.querySelector('#better-jobcan-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      if (overlayElement) {
        overlayElement.remove();
        overlayElement = null;
      }
    });
  }
}

/**
 * Update overlay content without recreating the element
 */
function updateOverlayContent(element: HTMLElement, metrics: WorkMetrics): void {
  const overworkTodayClass = metrics.overworkToday > 0 ? 'positive' : 'neutral';
  const overworkTotalClass = metrics.overworkTime > 0 ? 'positive' : 'neutral';
  const remainingClass = metrics.hoursRemainingToday > 0 ? 'warning' : 'success';

  const content = element.querySelector('.better-jobcan-content');
  if (content) {
    content.innerHTML = `
      <div class="better-jobcan-metric">
        <div class="metric-label">Overwork Today</div>
        <div class="metric-value ${overworkTodayClass}">${formatMinutesToTime(metrics.overworkToday)}</div>
      </div>

      <div class="better-jobcan-metric">
        <div class="metric-label">Total Overwork This Month</div>
        <div class="metric-value ${overworkTotalClass}">${formatMinutesToTime(metrics.overworkTime)}</div>
      </div>

      <div class="better-jobcan-metric">
        <div class="metric-label">Hours Remaining Today</div>
        <div class="metric-value ${remainingClass}">${formatMinutesToTime(metrics.hoursRemainingToday)}</div>
      </div>

      <div class="better-jobcan-metric">
        <div class="metric-label">Start Time Today</div>
        <div class="metric-value">${metrics.startTimeToday || 'Not started'}</div>
      </div>

      <div class="better-jobcan-metric">
        <div class="metric-label">Working Days Remaining</div>
        <div class="metric-value">${metrics.workingDaysRemaining}</div>
        <div style="font-size: 14px; opacity: 0.8; margin-top: 4px;">days</div>
      </div>

      <div class="better-jobcan-metric">
        <div class="metric-label">Hours Remaining for Monthly Quota</div>
        <div class="metric-value ${metrics.hoursRemainingForQuota > 0 ? 'warning' : 'success'}">
          ${formatMinutesToTime(metrics.hoursRemainingForQuota)}
        </div>
      </div>

      <div class="better-jobcan-metric">
        <div class="metric-label">Monthly Progress</div>
        <div class="metric-value" style="font-size: 22px;">
          ${formatMinutesToTime(metrics.currentMonthTotal)} / ${formatMinutesToTime(metrics.monthlyQuota)}
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${metrics.monthlyQuota > 0 ? Math.min(100, (metrics.currentMonthTotal / metrics.monthlyQuota) * 100) : 0}%"></div>
        </div>
      </div>
    `;
  }
}

/**
 * Update the metrics overlay with new data
 */
export function updateMetricsOverlay(metrics: WorkMetrics): void {
  if (overlayElement) {
    updateOverlayContent(overlayElement, metrics);
  } else {
    createMetricsOverlay(metrics);
  }
}

