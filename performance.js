// Performance Optimizations

document.addEventListener('DOMContentLoaded', function() {
    // Initialize performance optimizations
    initPerformanceOptimizations();
});

// Initialize performance optimizations
function initPerformanceOptimizations() {
    // Lazy load images
    initLazyLoading();
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Optimize font loading
    optimizeFontLoading();
    
    // Cache API responses
    initApiCaching();
}

// Lazy load images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in globalThis) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// Preload critical resources
function preloadCriticalResources() {
    // Preload critical fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap';
    fontLink.as = 'style';
    document.head.appendChild(fontLink);
    
    // Preload critical scripts
    const scriptLink = document.createElement('link');
    scriptLink.rel = 'preload';
    scriptLink.href = 'js/language.js';
    scriptLink.as = 'script';
    document.head.appendChild(scriptLink);
}

// Optimize font loading
function optimizeFontLoading() {
    // Add font-display: swap to font links
    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    fontLinks.forEach(link => {
        const url = new URL(link.href);
        if (!url.searchParams.has('display')) {
            url.searchParams.set('display', 'swap');
            link.href = url.toString();
        }
    });
}

// API response caching
function initApiCaching() {
    // Cache prayer times API responses (would be dynamic based on location)
    // This is handled by the service worker for offline functionality
}

// Cache API response
function cacheApiResponse(cacheKey, url) {
    // Check if we have cached data
    const cached = localStorage.getItem(`api_cache_${cacheKey}`);
    if (cached) {
        const cacheData = JSON.parse(cached);
        // Check if cache is still valid (24 hours)
        if (Date.now() - cacheData.timestamp < 24 * 60 * 60 * 1000) {
            console.log(`Using cached data for ${cacheKey}`);
            return cacheData.data;
        }
    }
    
    // Fetch fresh data
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Cache the response
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(`api_cache_${cacheKey}`, JSON.stringify(cacheData));
            console.log(`Cached fresh data for ${cacheKey}`);
        })
        .catch(error => {
            console.log(`Failed to cache ${cacheKey}:`, error);
        });
}

// Performance monitoring
function initPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('web-vitals' in globalThis) {
        // This would require the web-vitals library
        // For now, we'll use basic performance monitoring
    }
    
    // Monitor page load performance
    globalThis.addEventListener('load', () => {
        // Log performance metrics
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page load performance:', {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            totalTime: perfData.loadEventEnd - perfData.fetchStart
        });
    });
}

// Optimize resource loading
function optimizeResourceLoading() {
    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
        if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
            // Add defer to non-critical scripts
            if (!script.src.includes('language.js') && !script.src.includes('script.js')) {
                script.defer = true;
            }
        }
    });
    
    // Preload critical CSS
    const criticalCSS = document.querySelector('link[rel="stylesheet"]');
    if (criticalCSS) {
        criticalCSS.rel = 'preload';
        criticalCSS.as = 'style';
        criticalCSS.onload = function() {
            this.rel = 'stylesheet';
        };
    }
}

// Export functions for use in other modules
globalThis.Performance = {
    initLazyLoading: initLazyLoading,
    preloadCriticalResources: preloadCriticalResources,
    optimizeFontLoading: optimizeFontLoading,
    initApiCaching: initApiCaching,
    initPerformanceMonitoring: initPerformanceMonitoring,
    optimizeResourceLoading: optimizeResourceLoading
};