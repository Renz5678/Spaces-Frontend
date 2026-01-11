/**
 * Performance monitoring utilities
 * Helps track and optimize application performance
 */

/**
 * Measure component render time
 */
export function measureRenderTime(componentName, callback) {
    const start = performance.now();
    const result = callback();
    const end = performance.now();

    if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${(end - start).toFixed(2)}ms`);
    }

    return result;
}

/**
 * Debounce function for performance optimization
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
 * Throttle function for performance optimization
 */
export function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
