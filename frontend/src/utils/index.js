/**
 * Format a date to a human-readable Indian locale string.
 * @param {string|Date} date
 * @param {Intl.DateTimeFormatOptions} options
 */
export function formatDate(date, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', options);
}

/**
 * Truncate a string to a maximum length, appending '…'.
 * @param {string} str
 * @param {number} maxLength
 */
export function truncate(str, maxLength = 80) {
  if (!str || str.length <= maxLength) return str || '';
  return str.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Conditionally join class names (minimal classnames util).
 * Usage: cn('base', condition && 'extra', { active: isActive })
 * @param {...(string|object|boolean|undefined|null)} classes
 */
export function cn(...classes) {
  return classes
    .flatMap(cls => {
      if (!cls) return [];
      if (typeof cls === 'string') return [cls];
      if (typeof cls === 'object') {
        return Object.entries(cls)
          .filter(([, v]) => v)
          .map(([k]) => k);
      }
      return [];
    })
    .join(' ');
}

/**
 * Format a number in LPA (e.g. 3.5 → '₹3.5 LPA').
 * @param {number|undefined} lpa
 */
export function formatCTC(min, max) {
  if (!min && !max) return 'Not disclosed';
  if (min && max) return `₹${min}–${max} LPA`;
  return `₹${min || max} LPA`;
}

/**
 * Format seconds into mm:ss display.
 * @param {number} totalSeconds
 */
export function formatTime(totalSeconds) {
  if (!totalSeconds && totalSeconds !== 0) return '—';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
