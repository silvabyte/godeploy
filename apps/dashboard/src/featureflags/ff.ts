// Feature flags are defined as powers of 2 (single bits)
export const FLAGS = {
	ENABLE_OFFER: 1, // 00000001
	ENABLE_SUBSCRIPTIONS: 2, // 00000010
	ENABLE_CUSTOM_DOMAINS: 4,
	ENABLE_DELETE_PROJECTS: 8,
	ENABLE_CREATE_PROJECT: 16,
	//next would be 4, 8, 16, 32, 64, 128, 256.. so on and so forth
} as const;

// Default flags enabled out of the box
// Lifted features: custom domains and delete project
const DEFAULT_ENABLED_FLAGS =
	FLAGS.ENABLE_CUSTOM_DOMAINS | FLAGS.ENABLE_DELETE_PROJECTS;

/**
 * FeatureFlags uses bitwise operations to efficiently store and check feature flags
 * Example: FLAGS.ENABLE_OFFER | FLAGS.ENABLE_SUBSCRIPTIONS = 3 (00000011)
 */
export class FeatureFlags {
	private static instance: FeatureFlags;
	private store: Storage;
	private flags: number = 0;

	private constructor(store: Storage = localStorage, initialFlags?: number) {
		this.store = store;
		const storedFlags = this.loadFlags();
		this.flags =
			initialFlags !== undefined
				? this.mergeFlags(storedFlags, initialFlags)
				: storedFlags;
		if (initialFlags !== undefined) {
			this.saveFlags();
		}
	}

	/**
	 * Get the singleton instance of FeatureFlags
	 */
	static getInstance(store?: Storage, initialFlags?: number): FeatureFlags {
		if (!FeatureFlags.instance) {
			FeatureFlags.instance = new FeatureFlags(store, initialFlags);
		}
		return FeatureFlags.instance;
	}

	private loadFlags(): number {
		const stored = this.store.getItem("feature_flags");
		return stored ? parseInt(stored, 10) : DEFAULT_ENABLED_FLAGS;
	}

	private saveFlags(): void {
		this.store.setItem("feature_flags", this.flags.toString(10));
	}

	/**
	 * Merge URL flags with stored flags
	 * URL flags take precedence over stored flags
	 * Example:
	 * - Stored: 3 (ENABLE_OFFER | ENABLE_SUBSCRIPTIONS)
	 * - URL: -1 (disable ENABLE_OFFER)
	 * - Result: 2 (only ENABLE_SUBSCRIPTIONS)
	 */
	private mergeFlags(stored: number, url: number): number {
		// First apply any negative flags from URL
		const negativeFlags = url < 0 ? Math.abs(url) : 0;
		let result = stored & ~negativeFlags;

		// Then apply any positive flags from URL
		const positiveFlags = url > 0 ? url : 0;
		result |= positiveFlags;

		return result;
	}

	/**
	 * Enable one or more feature flags using bitwise OR
	 * Example: enable(FLAGS.ENABLE_OFFER | FLAGS.ENABLE_SUBSCRIPTIONS)
	 */
	enable(flags: number): void {
		this.flags |= flags;
		this.saveFlags();
	}

	/**
	 * Disable one or more feature flags using bitwise AND with NOT
	 * Example: disable(FLAGS.ENABLE_OFFER)
	 */
	disable(flags: number): void {
		this.flags &= ~flags;
		this.saveFlags();
	}

	/**
	 * Check if specific flags are enabled using bitwise AND
	 * Example: isEnabled(FLAGS.ENABLE_OFFER)
	 */
	isEnabled(flags: number): boolean {
		return (this.flags & flags) !== 0;
	}

	/**
	 * Check if exactly these flags are enabled (no more, no less)
	 * Example: isExactly(FLAGS.ENABLE_OFFER | FLAGS.ENABLE_SUBSCRIPTIONS)
	 */
	isExactly(flags: number): boolean {
		return this.flags === flags;
	}

	/**
	 * Get all currently enabled flags
	 */
	getEnabledFlags(): number {
		return this.flags;
	}

	/**
	 * Clear all feature flags
	 */
	clear(): void {
		this.flags = 0;
		this.saveFlags();
	}
}
