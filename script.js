// Main JavaScript functionality

let deferredPrompt; // PWA Install Prompt

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize loader
    setTimeout(() => {
        document.querySelector('.loader').classList.add('hidden');
    }, 1500);

    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize theme toggle
    initThemeToggle();
    
   
    
    // Initialize visual card items
    initVisualCard();
    
    // Add scroll effect to header
    initHeaderScroll();
    
    // Initialize language selector
    initLanguageSelector();
    
    // Initialize PWA
    initPWA();
    
    // Initialize performance optimizations
    if (globalThis.Performance) {
        globalThis.Performance.initPerformanceMonitoring();
        globalThis.Performance.optimizeResourceLoading();
    }
});

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!mobileToggle || !navMenu) return;

    function toggleMobileMenu() {
        const isOpen = navMenu.classList.contains('active');
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function openMobileMenu() {
        mobileToggle.classList.add('active');
        navMenu.classList.add('active');
        
        // Focus management
        const firstLink = navMenu.querySelector('.nav-link');
        if (firstLink) {
            firstLink.focus();
        }
        
        // Announce to screen readers
        navMenu.setAttribute('aria-expanded', 'true');
    }

    function closeMobileMenu() {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
        
        // Focus management
        mobileToggle.focus();
        
        // Announce to screen readers
        navMenu.setAttribute('aria-expanded', 'false');
    }
    
    // Click event
    mobileToggle.addEventListener('click', () => {
        toggleMobileMenu();
    });
    
    // Keyboard event
    mobileToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMobileMenu();
        }
    });
    
    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
    
    // Close menu when pressing Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

// Theme Toggle
function initThemeToggle() {
    // Create theme toggle button
    const themeToggle = document.createElement('div');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    document.body.appendChild(themeToggle);
    
    // Check for saved theme preference or default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });
}

// Prayer Time Widget
function initPrayerTimeWidget() {
    const prayerWidget = document.querySelector('.prayer-time-widget');
    if (!prayerWidget) return;
    
    // Mock prayer times (in a real app, these would come from an API)
    const prayerTimes = {
        Fajr: '05:30',
        Dhuhr: '12:30',
        Asr: '15:45',
        Maghrib: '18:20',
        Isha: '19:45'
    };
    
    // Find next prayer
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    let nextPrayer = null;
    let nextPrayerTime = null;
    
    for (const [prayer, time] of Object.entries(prayerTimes)) {
        const [hours, minutes] = time.split(':').map(Number);
        const prayerTime = hours * 60 + minutes;
        
        if (prayerTime > currentTime) {
            nextPrayer = prayer;
            nextPrayerTime = prayerTime;
            break;
        }
    }
    
    // If no prayer found for today, use first prayer of next day
    if (!nextPrayer) {
        nextPrayer = 'Fajr';
        nextPrayerTime = 24 * 60 + 5 * 60 + 30; // Next day Fajr
    }
    
    // Update widget
    const prayerNameEl = document.getElementById('next-prayer-name');
    const prayerTimeEl = document.getElementById('next-prayer-time');
    const countdownEl = document.getElementById('prayer-countdown');
    
    if (prayerNameEl) prayerNameEl.textContent = nextPrayer;
    if (prayerTimeEl) prayerTimeEl.textContent = prayerTimes[nextPrayer] || '05:30';
    
    // Update countdown
    function updateCountdown() {
        const now = new Date();
        
        let targetTime;
        if (nextPrayerTime > 24 * 60) {
            // Next day prayer
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(5, 30, 0, 0);
            targetTime = Math.floor(tomorrow.getTime() / 1000);
        } else {
            // Today's prayer
            const target = new Date(now);
            target.setHours(Math.floor(nextPrayerTime / 60), nextPrayerTime % 60, 0, 0);
            targetTime = Math.floor(target.getTime() / 1000);
        }
        
        const currentTimeSeconds = Math.floor(now.getTime() / 1000);
        const diff = targetTime - currentTimeSeconds;
        
        if (diff <= 0) {
            // Prayer time reached, reload to get next prayer
            location.reload();
            return;
        }
        
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        
        if (countdownEl) {
            countdownEl.textContent = `${hours}h ${minutes}m ${seconds}s`;
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Visual Card Animation
function initVisualCard() {
    const visualItems = document.querySelectorAll('.visual-item');
    if (visualItems.length === 0) return;
    
    let currentIndex = 0;
    
    function rotateItems() {
        visualItems.forEach(item => item.classList.remove('active'));
        visualItems[currentIndex].classList.add('active');
        
        currentIndex = (currentIndex + 1) % visualItems.length;
    }
    
    // Rotate every 3 seconds
    setInterval(rotateItems, 3000);
}

// Header Scroll Effect
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(245, 245, 220, 0.98)';
            if (document.body.classList.contains('dark-mode')) {
                header.style.backgroundColor = 'rgba(26, 26, 26, 0.98)';
            }
        } else {
            header.style.backgroundColor = 'rgba(245, 245, 220, 0.95)';
            if (document.body.classList.contains('dark-mode')) {
                header.style.backgroundColor = 'rgba(26, 26, 26, 0.95)';
            }
        }
    });
}

// Language Selector
function initLanguageSelector() {
    const languageSelect = document.getElementById('languageSelect');
    if (!languageSelect) return;

    // Check for saved language preference
    const savedLanguage = localStorage.getItem('language') || 'en';
    languageSelect.value = savedLanguage;

    languageSelect.addEventListener('change', function() {
        const selectedLanguage = this.value;
        localStorage.setItem('language', selectedLanguage);

        // Call the translation function from language.js
        if (typeof translatePage === 'function') {
            translatePage(selectedLanguage);
        }
    });
}

// Navigation Functions
function goToPage(page) {
    globalThis.location.href = page;
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({
        behavior: 'smooth'
    });
}

// Utility function to format dates
function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString(undefined, options);
}

// Utility function to format time
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Add some interactive animations
document.addEventListener('DOMContentLoaded', function() {
    // Animate feature cards on scroll
    const featureCards = document.querySelectorAll('.feature-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
});

    // Initialize PWA functionality
    function initPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            globalThis.addEventListener('load', registerServiceWorker);
        }
        
        // Handle install prompt
        globalThis.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            deferredPrompt = e;
            
            // Show install button or banner
            showInstallPrompt();
        });
        
        // Handle successful installation
        globalThis.addEventListener('appinstalled', (evt) => {
            console.log('PWA was installed successfully');
            hideInstallPrompt();
        });
    }

// Show install prompt
function showInstallPrompt() {
    // Create install banner
    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.innerHTML = `
        <div class="install-banner-content">
            <i class="fas fa-mobile-alt"></i>
            <div class="install-text">
                <strong>Install Hidaya</strong>
                <span>Add to home screen for the best experience</span>
            </div>
            <div class="install-actions">
                <button id="install-btn" class="btn-primary">Install</button>
                <button id="dismiss-btn" class="btn-secondary">Not now</button>
            </div>
        </div>
    `;
    
    installBanner.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: var(--primary);
        color: var(--dark);
        padding: 1rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-dark);
        z-index: 1000;
        display: none;
    `;
    
    document.body.appendChild(installBanner);
    
    // Show banner with animation
    setTimeout(() => {
        installBanner.style.display = 'block';
        installBanner.style.animation = 'slideUp 0.3s ease-out';
    }, 2000); // Show after 2 seconds
    
    // Handle install button
    document.getElementById('install-btn').addEventListener('click', () => {
        hideInstallPrompt();
        // Trigger install prompt
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
            });
        }
    });
    
    // Handle dismiss button
    document.getElementById('dismiss-btn').addEventListener('click', () => {
        hideInstallPrompt();
    });
}

// Register service worker
function registerServiceWorker() {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('SW registered: ', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            showUpdateNotification();
                        }
                    });
                }
            });
        })
        .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
}

// Hide install prompt
function hideInstallPrompt() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.style.animation = 'slideDown 0.3s ease-out';
        setTimeout(() => {
            banner.remove();
        }, 300);
    }
}

// Show update notification
function showUpdateNotification() {
    const updateToast = document.createElement('div');
    updateToast.id = 'update-toast';
    updateToast.innerHTML = `
        <div class="update-toast-content">
            <i class="fas fa-sync-alt"></i>
            <span>New version available!</span>
            <button id="update-btn" class="btn-primary">Update</button>
        </div>
    `;

    updateToast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary);
        color: var(--dark);
        padding: 1rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-dark);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(updateToast);

    // Handle update button
    document.getElementById('update-btn').addEventListener('click', () => {
        // Tell the service worker to skip waiting
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
            });
        }
        updateToast.remove();

        // Reload the page
        globalThis.location.reload();
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (updateToast.parentNode) {
            updateToast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => updateToast.remove(), 300);
        }
    }, 10000);
}

// Daily Islamic Guidance functions
function toggleLike() {
    const likeBtn = document.querySelector('.btn-like');
    const likeIcon = likeBtn.querySelector('i');
    const likesCount = document.getElementById('likes-count');
    let currentLikes = parseInt(likesCount.textContent);

    if (likeIcon.classList.contains('far')) {
        // Like it
        likeIcon.classList.remove('far');
        likeIcon.classList.add('fas');
        likeIcon.style.color = '#e74c3c';
        likesCount.textContent = currentLikes + 1;
    } else {
        // Unlike it
        likeIcon.classList.remove('fas');
        likeIcon.classList.add('far');
        likeIcon.style.color = '';
        likesCount.textContent = currentLikes - 1;
    }
}

function refreshGuidance() {
    const guidanceText = document.querySelector('.guidance-text p');
    const guidanceCite = document.querySelector('.guidance-text cite');

    // Array of sample hadiths/verses for rotation
    const guidances = [
        {
            text: '"The best among you are those who have the best manners and character."',
            cite: '- Prophet Muhammad (PBUH)'
        },
        {
            text: '"Do not be angry."',
            cite: '- Prophet Muhammad (PBUH)'
        },
        {
            text: '"The strong is not the one who overcomes the people by his strength, but the strong is the one who controls himself while in anger."',
            cite: '- Prophet Muhammad (PBUH)'
        },
        {
            text: '"Whoever believes in Allah and the Last Day, let him speak good or keep silent."',
            cite: '- Prophet Muhammad (PBUH)'
        }
    ];

    // Get random guidance
    const randomGuidance = guidances[Math.floor(Math.random() * guidances.length)];

    guidanceText.textContent = randomGuidance.text;
    guidanceCite.textContent = randomGuidance.cite;
}

function copyGuidance() {
    const guidanceText = document.querySelector('.guidance-text p').textContent;
    const guidanceCite = document.querySelector('.guidance-text cite').textContent;
    const fullText = `${guidanceText} ${guidanceCite}`;

    navigator.clipboard.writeText(fullText).then(function() {
        // Show temporary feedback
        const copyBtn = document.querySelector('.btn-copy');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }).catch(function(err) {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard');
    });
}
