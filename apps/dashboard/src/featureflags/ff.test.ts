import { beforeEach, describe, expect, it, vi } from "vitest";
import { FeatureFlags, FLAGS } from "./ff";

describe("FeatureFlags", () => {
	let mockStorage: Storage & { getItem: ReturnType<typeof vi.fn> };
	let flags: FeatureFlags;

	beforeEach(() => {
		mockStorage = {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			length: 0,
			key: vi.fn(),
		} as Storage & { getItem: ReturnType<typeof vi.fn> };
		// Reset singleton instance
		(
			FeatureFlags as unknown as { instance: FeatureFlags | undefined }
		).instance = undefined;
		flags = FeatureFlags.getInstance(mockStorage);
	});

	it("should initialize with no flags enabled", () => {
		expect(flags.getEnabledFlags()).toBe(0);
	});

	it("should enable a single flag", () => {
		flags.enable(FLAGS.ENABLE_OFFER);
		expect(flags.isEnabled(FLAGS.ENABLE_OFFER)).toBe(true);
		expect(flags.getEnabledFlags()).toBe(1);
	});

	it("should enable multiple flags", () => {
		flags.enable(FLAGS.ENABLE_OFFER | FLAGS.ENABLE_SUBSCRIPTIONS);
		expect(flags.isEnabled(FLAGS.ENABLE_OFFER)).toBe(true);
		expect(flags.isEnabled(FLAGS.ENABLE_SUBSCRIPTIONS)).toBe(true);
		expect(flags.getEnabledFlags()).toBe(3);
	});

	it("should disable a flag", () => {
		flags.enable(FLAGS.ENABLE_OFFER);
		flags.disable(FLAGS.ENABLE_OFFER);
		expect(flags.isEnabled(FLAGS.ENABLE_OFFER)).toBe(false);
		expect(flags.getEnabledFlags()).toBe(0);
	});

	it("should clear all flags", () => {
		flags.enable(FLAGS.ENABLE_OFFER | FLAGS.ENABLE_SUBSCRIPTIONS);
		flags.clear();
		expect(flags.getEnabledFlags()).toBe(0);
		expect(flags.isEnabled(FLAGS.ENABLE_OFFER)).toBe(false);
		expect(flags.isEnabled(FLAGS.ENABLE_SUBSCRIPTIONS)).toBe(false);
	});

	it("should load flags from storage on initialization", () => {
		// Reset singleton to ensure clean state
		(
			FeatureFlags as unknown as { instance: FeatureFlags | undefined }
		).instance = undefined;

		mockStorage.getItem.mockReturnValue("3");
		const flagsWithStorage = FeatureFlags.getInstance(mockStorage);
		expect(flagsWithStorage.getEnabledFlags()).toBe(3);
	});

	it("should merge URL flags with stored flags", () => {
		// Reset singleton to ensure clean state
		(
			FeatureFlags as unknown as { instance: FeatureFlags | undefined }
		).instance = undefined;

		mockStorage.getItem.mockReturnValue("3");
		const flagsWithUrl = FeatureFlags.getInstance(mockStorage, -1);
		expect(flagsWithUrl.getEnabledFlags()).toBe(2); // 3 & ~1 = 2
	});

	it("should check if exactly these flags are enabled", () => {
		flags.enable(FLAGS.ENABLE_OFFER | FLAGS.ENABLE_SUBSCRIPTIONS);
		expect(
			flags.isExactly(FLAGS.ENABLE_OFFER | FLAGS.ENABLE_SUBSCRIPTIONS),
		).toBe(true);
		expect(flags.isExactly(FLAGS.ENABLE_OFFER)).toBe(false);
	});

	it("should maintain singleton instance", () => {
		const instance1 = FeatureFlags.getInstance();
		const instance2 = FeatureFlags.getInstance();
		expect(instance1).toBe(instance2);
	});
});
