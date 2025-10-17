/**
 * Simplified Mixpanel Configuration for Frontend Developers Campaign
 * Focused on core funnel metrics
 */

// Mixpanel project token
export const MIXPANEL_TOKEN = "ebb47f6d4701506aba26200dd42d8f11";

// Core funnel event names
export const EVENTS = {
	// Basic funnel stages
	PAGE_VIEW: "Page View",
	FORM_START: "Form Start",
	FORM_SUBMIT: "Form Submit",
	ALPHA_SIGNUP: "Alpha Signup",

	// Key engagement
	CTA_CLICK: "CTA Click",
};

// Minimal properties to include with all events
export const DEFAULT_PROPERTIES = {
	project: "fe_devs_campaign",
	campaign: "spa_deployment_alpha",
};
// Simple configuration for automatic tracking
export const AUTO_TRACK_CONFIG = {
	// CSS selectors for elements to auto-track
	selectors: {
		ctaButtons: '.cta-button, .primary-button, [data-track="cta"]',
		alphaSignup: '#alpha-signup-form, [data-form-type="alpha"]',
	},

	// Single A/B test for CTA
	experiments: {
		ctaText: {
			variants: ["join_alpha", "early_access"],
			defaultVariant: "join_alpha",
		},
	},
};

// Export simplified configuration
export default {
	token: MIXPANEL_TOKEN,
	events: EVENTS,
	defaultProperties: DEFAULT_PROPERTIES,
	autoTrackConfig: AUTO_TRACK_CONFIG,
};
