/**
 * Global helper functions
 */

/**
 * Get CSRF token from meta tag (for compatibility)
 * @returns {string|null} CSRF token or null if not found
 */
export function getCsrfToken() {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') : null;
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
}

/**
 * Format date and time for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time
 */
export function formatDateTime(date) {
    if (!date) return '';
    return new Date(date).toLocaleString();
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Make getCsrfToken available globally for legacy compatibility
if (typeof window !== 'undefined') {
    window.getCsrfToken = getCsrfToken;
}