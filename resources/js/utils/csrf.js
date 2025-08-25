/**
 * CSRF Token Management Utility
 * Handles CSRF token refreshing and validation
 */

let tokenRefreshPromise = null;

/**
 * Get CSRF token from meta tag
 * @returns {string|null} CSRF token or null if not found
 */
export function getCsrfToken() {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') : null;
}

/**
 * Set CSRF token in meta tag
 * @param {string} token - New CSRF token
 */
export function setCsrfToken(token) {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
        metaTag.setAttribute('content', token);
    }
}

/**
 * Refresh CSRF token from server
 * @returns {Promise<string>} Promise resolving to new CSRF token
 */
export async function refreshCsrfToken() {
    // Prevent multiple simultaneous refresh requests
    if (tokenRefreshPromise) {
        return tokenRefreshPromise;
    }

    tokenRefreshPromise = fetch('/csrf-token', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const newToken = data.csrf_token;
        setCsrfToken(newToken);
        console.log('CSRF token refreshed successfully');
        return newToken;
    })
    .catch(error => {
        console.error('Failed to refresh CSRF token:', error);
        throw error;
    })
    .finally(() => {
        tokenRefreshPromise = null;
    });

    return tokenRefreshPromise;
}

/**
 * Make a fetch request with CSRF token and automatic retry on 419 errors
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retries (default: 1)
 * @returns {Promise<Response>} Fetch response
 */
export async function fetchWithCsrf(url, options = {}, retries = 1) {
    const token = getCsrfToken();
    
    const requestOptions = {
        ...options,
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers,
        }
    };

    // Add CSRF token to headers if available
    if (token) {
        requestOptions.headers['X-CSRF-TOKEN'] = token;
    }

    try {
        const response = await fetch(url, requestOptions);
        
        // If CSRF error and we have retries left, refresh token and try again
        if (response.status === 419 && retries > 0) {
            console.log('CSRF token mismatch, refreshing and retrying...');
            await refreshCsrfToken();
            
            // Update the request with new token
            const newToken = getCsrfToken();
            if (newToken) {
                requestOptions.headers['X-CSRF-TOKEN'] = newToken;
            }
            
            return fetchWithCsrf(url, options, retries - 1);
        }
        
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

/**
 * Check if CSRF token is valid by making a test request
 * @returns {Promise<boolean>} True if token is valid
 */
export async function validateCsrfToken() {
    try {
        const response = await fetch('/csrf-token', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': getCsrfToken(),
            }
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Initialize CSRF token management
 * - Refreshes token on page focus if it might be stale
 * - Sets up periodic token validation
 */
export function initializeCsrfManagement() {
    let lastActivity = Date.now();
    
    // Track user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, () => {
            lastActivity = Date.now();
        }, { passive: true });
    });
    
    // Refresh token when page gains focus if it's been a while
    document.addEventListener('visibilitychange', async () => {
        if (!document.hidden && Date.now() - lastActivity > 30 * 60 * 1000) { // 30 minutes
            try {
                await refreshCsrfToken();
            } catch (error) {
                console.warn('Could not refresh CSRF token on focus:', error);
            }
        }
    });
    
    // Periodic token validation (every 15 minutes)
    setInterval(async () => {
        if (Date.now() - lastActivity < 15 * 60 * 1000) { // Only if user is active
            const isValid = await validateCsrfToken();
            if (!isValid) {
                try {
                    await refreshCsrfToken();
                } catch (error) {
                    console.warn('Could not refresh invalid CSRF token:', error);
                }
            }
        }
    }, 15 * 60 * 1000); // 15 minutes
}