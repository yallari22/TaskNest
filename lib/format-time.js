/**
 * Format minutes into a human-readable string (e.g., "2h 30m")
 * @param {number} minutes - The number of minutes to format
 * @returns {string} - Formatted time string
 */
export function formatTimeSpent(minutes) {
  if (!minutes || minutes <= 0) {
    return "0m";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
}

/**
 * Parse a time string (e.g., "2h 30m") into minutes
 * @param {string} timeString - The time string to parse
 * @returns {number} - Total minutes
 */
export function parseTimeString(timeString) {
  if (!timeString) {
    return 0;
  }

  let totalMinutes = 0;
  
  // Match hours (e.g., "2h")
  const hoursMatch = timeString.match(/(\d+)\s*h/);
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1], 10) * 60;
  }
  
  // Match minutes (e.g., "30m")
  const minutesMatch = timeString.match(/(\d+)\s*m/);
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1], 10);
  }
  
  return totalMinutes;
}
