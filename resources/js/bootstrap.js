import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Set up CSRF token for axios
const token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Add axios interceptor to handle CSRF token refresh
window.axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 419 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Get fresh CSRF token
                const csrfResponse = await axios.get('/csrf-token');
                const newToken = csrfResponse.data.csrf_token;
                
                // Update the token in meta tag
                const metaTag = document.querySelector('meta[name="csrf-token"]');
                if (metaTag) {
                    metaTag.setAttribute('content', newToken);
                }
                
                // Update axios default headers
                window.axios.defaults.headers.common['X-CSRF-TOKEN'] = newToken;
                
                // Update the failed request with new token
                originalRequest.headers['X-CSRF-TOKEN'] = newToken;
                
                // Retry the original request
                return window.axios(originalRequest);
            } catch (refreshError) {
                console.error('Could not refresh CSRF token:', refreshError);
                return Promise.reject(error);
            }
        }
        
        return Promise.reject(error);
    }
);
