/**
 * GoDeploy SPA Demo - Main JavaScript
 * For tenant-456/another-app
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Display the hostname
    displayHostname();

    // Set up SPA navigation
    setupSPANavigation();

    // Initialize any interactive elements
    initializeInteractiveElements();

    // Add a tenant-specific greeting
    addTenantGreeting();
});

/**
 * Display the current hostname in the info panel
 */
function displayHostname() {
    const hostnameElement = document.getElementById('hostname');
    if (hostnameElement) {
        hostnameElement.textContent = window.location.hostname;
    }
}

/**
 * Add a tenant-specific greeting to the page
 */
function addTenantGreeting() {
    // Create a greeting element
    const greeting = document.createElement('div');
    greeting.className = 'tenant-greeting';
    greeting.innerHTML = '<p>Welcome to Tenant 456 - Another App!</p>';
    greeting.style.position = 'fixed';
    greeting.style.bottom = '20px';
    greeting.style.right = '20px';
    greeting.style.backgroundColor = 'var(--primary-color)';
    greeting.style.color = 'white';
    greeting.style.padding = '10px 15px';
    greeting.style.borderRadius = 'var(--border-radius)';
    greeting.style.boxShadow = 'var(--box-shadow)';
    greeting.style.zIndex = '1000';
    greeting.style.opacity = '0';
    greeting.style.transform = 'translateY(20px)';
    greeting.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

    // Add to the body
    document.body.appendChild(greeting);

    // Show after a delay
    setTimeout(() => {
        greeting.style.opacity = '1';
        greeting.style.transform = 'translateY(0)';

        // Hide after 5 seconds
        setTimeout(() => {
            greeting.style.opacity = '0';
            greeting.style.transform = 'translateY(20px)';

            // Remove from DOM after animation
            setTimeout(() => {
                document.body.removeChild(greeting);
            }, 500);
        }, 5000);
    }, 1000);
}

/**
 * Set up SPA navigation to handle client-side routing
 */
function setupSPANavigation() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('nav a');

    // Add click event listeners to each link
    navLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            // Only handle links to our own domain
            if (this.hostname === window.location.hostname) {
                event.preventDefault();

                // Get the path from the link
                const path = this.pathname;

                // Update the URL without reloading the page
                window.history.pushState({ path }, '', path);

                // Handle the route change
                handleRouteChange(path);
            }
        });
    });

    // Listen for back/forward button navigation
    window.addEventListener('popstate', function (event) {
        const path = window.location.pathname;
        handleRouteChange(path);
    });

    // Initial route handling
    handleRouteChange(window.location.pathname);
}

/**
 * Handle route changes by updating the UI
 * @param {string} path - The current path
 */
function handleRouteChange(path) {
    // Update active navigation link
    updateActiveNavLink(path);

    // In a real SPA, we would load different content based on the path
    // For this demo, we'll just show a message in the console
    console.log(`Route changed to: ${path}`);

    // Simulate content change with a message in the hero section
    updateHeroContent(path);
}

/**
 * Update the active navigation link based on the current path
 * @param {string} path - The current path
 */
function updateActiveNavLink(path) {
    // Remove active class from all links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => link.classList.remove('active'));

    // Add active class to the matching link
    navLinks.forEach(link => {
        if (link.pathname === path) {
            link.classList.add('active');
        }
    });
}

/**
 * Update the hero content based on the current path
 * @param {string} path - The current path
 */
function updateHeroContent(path) {
    const heroTitle = document.querySelector('.hero h2');
    const heroText = document.querySelector('.hero p');

    if (!heroTitle || !heroText) return;

    // Update content based on path
    switch (path) {
        case '/':
            heroTitle.textContent = 'Welcome to Another App';
            heroText.textContent = 'This is a different SPA for the second tenant, demonstrating multi-tenant capabilities.';
            break;
        case '/products':
            heroTitle.textContent = 'Our Products';
            heroText.textContent = 'Explore our range of products designed to help you build and deploy web applications.';
            break;
        case '/services':
            heroTitle.textContent = 'Our Services';
            heroText.textContent = 'We offer a range of services to help you implement and maintain your web applications.';
            break;
        case '/contact':
            heroTitle.textContent = 'Contact Us';
            heroText.textContent = 'Get in touch with our team to discuss your project requirements.';
            break;
        default:
            heroTitle.textContent = 'Page Not Found';
            heroText.textContent = `The page at ${path} does not exist. This demonstrates how the SPA handles unknown routes.`;
    }

    // Add a fade-in animation effect
    heroTitle.style.animation = 'fadeIn 0.5s ease-in-out';
    heroText.style.animation = 'fadeIn 0.5s ease-in-out';

    // Reset animation after it completes
    setTimeout(() => {
        heroTitle.style.animation = '';
        heroText.style.animation = '';
    }, 500);
}

/**
 * Initialize any interactive elements in the UI
 */
function initializeInteractiveElements() {
    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(-5px)';
        });
    });

    // Log page load time
    const loadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;
    console.log(`Page loaded in ${loadTime}ms`);
} 