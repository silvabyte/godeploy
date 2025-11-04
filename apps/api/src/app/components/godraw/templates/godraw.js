/* GoDraw Site Runtime */

(() => {
	/**
	 * Initialize navigation highlighting
	 */
	function initNavigation() {
		const currentPath = window.location.pathname;
		const navLinks = document.querySelectorAll(".godraw-nav a");

		navLinks.forEach((link) => {
			const linkPath = new URL(link.href).pathname;
			if (linkPath === currentPath) {
				link.classList.add("active");
			}
		});
	}

	/**
	 * Initialize clickable links on Excalidraw elements
	 */
	function initInteractiveElements() {
		// Handle elements with data-godraw-link attribute
		document.querySelectorAll("[data-godraw-link]").forEach((element) => {
			element.addEventListener("click", function (e) {
				e.preventDefault();
				const link = this.getAttribute("data-godraw-link");
				if (link) {
					// Handle internal vs external links
					if (link.startsWith("http://") || link.startsWith("https://")) {
						// External link - open in new tab
						window.open(link, "_blank", "noopener,noreferrer");
					} else {
						// Internal link - navigate
						window.location.href = link;
					}
				}
			});

			// Add visual feedback
			element.style.cursor = "pointer";
			element.setAttribute("title", "Click to navigate");
		});
	}

	/**
	 * Handle keyboard navigation
	 */
	function initKeyboardNav() {
		document.addEventListener("keydown", (e) => {
			// Press 'h' to go home
			if (e.key === "h" && !e.ctrlKey && !e.metaKey && !isTyping()) {
				const homeLink = document.querySelector(
					'.godraw-nav a[href="/"], .godraw-nav a[href="index.html"]',
				);
				if (homeLink) {
					window.location.href = homeLink.href;
				}
			}
		});
	}

	/**
	 * Check if user is typing in an input
	 */
	function isTyping() {
		const activeElement = document.activeElement;
		return (
			activeElement &&
			(activeElement.tagName === "INPUT" ||
				activeElement.tagName === "TEXTAREA" ||
				activeElement.isContentEditable)
		);
	}

	/**
	 * Add smooth scroll behavior
	 */
	function initSmoothScroll() {
		document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
			anchor.addEventListener("click", function (e) {
				e.preventDefault();
				const target = document.querySelector(this.getAttribute("href"));
				if (target) {
					target.scrollIntoView({
						behavior: "smooth",
						block: "start",
					});
				}
			});
		});
	}

	/**
	 * Initialize theme from system preference
	 */
	function initTheme() {
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)",
		).matches;
		const currentTheme = document.documentElement.getAttribute("data-theme");

		if (!currentTheme) {
			// No theme set, use system preference
			if (prefersDark) {
				document.documentElement.setAttribute("data-theme", "dark");
			}
		}

		// Listen for system theme changes
		window
			.matchMedia("(prefers-color-scheme: dark)")
			.addEventListener("change", (e) => {
				const newTheme = e.matches ? "dark" : "light";
				document.documentElement.setAttribute("data-theme", newTheme);
			});
	}

	/**
	 * Add meta viewport if missing (for mobile responsiveness)
	 */
	function ensureViewport() {
		if (!document.querySelector('meta[name="viewport"]')) {
			const meta = document.createElement("meta");
			meta.name = "viewport";
			meta.content = "width=device-width, initial-scale=1.0";
			document.head.appendChild(meta);
		}
	}

	/**
	 * Initialize all features when DOM is ready
	 */
	function init() {
		ensureViewport();
		initTheme();
		initNavigation();
		initInteractiveElements();
		initKeyboardNav();
		initSmoothScroll();

		// Log initialization for debugging
		console.log("[GoDraw] Site initialized", {
			pages: document.querySelectorAll(".godraw-nav a").length,
			interactiveElements:
				document.querySelectorAll("[data-godraw-link]").length,
		});
	}

	// Initialize when DOM is ready
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}

	// Expose GoDraw API for advanced usage
	window.GoDraw = {
		version: "1.0.0",
		navigate: (path) => {
			window.location.href = path;
		},
		theme: {
			get: () => document.documentElement.getAttribute("data-theme") || "light",
			set: (theme) => {
				if (theme === "light" || theme === "dark") {
					document.documentElement.setAttribute("data-theme", theme);
				}
			},
		},
	};
})();
