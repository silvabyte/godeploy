import { useCallback, useEffect, useRef, useState } from "react";

interface AutoSaveOptions<T> {
	/**
	 * Function to call when saving
	 */
	onSave: (data: T) => Promise<void> | void;
	/**
	 * Debounce delay in milliseconds
	 * @default 2000
	 */
	delay?: number;
	/**
	 * Whether auto-save is enabled
	 * @default true
	 */
	enabled?: boolean;
}

interface AutoSaveState {
	/**
	 * Whether a save is currently in progress
	 */
	isSaving: boolean;
	/**
	 * Whether there are unsaved changes
	 */
	hasUnsavedChanges: boolean;
	/**
	 * Last save timestamp
	 */
	lastSaved: Date | null;
	/**
	 * Last error that occurred during save
	 */
	error: Error | null;
}

/**
 * Hook for auto-saving data with debouncing
 *
 * @example
 * ```tsx
 * const { save, isSaving, hasUnsavedChanges } = useAutoSave({
 *   onSave: async (data) => {
 *     await api.patch(`/pages/${pageId}`, data);
 *   },
 *   delay: 2000,
 * });
 *
 * // In onChange handler
 * save({ elements, appState, files });
 * ```
 */
export function useAutoSave<T>({
	onSave,
	delay = 2000,
	enabled = true,
}: AutoSaveOptions<T>) {
	const [state, setState] = useState<AutoSaveState>({
		isSaving: false,
		hasUnsavedChanges: false,
		lastSaved: null,
		error: null,
	});

	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const pendingDataRef = useRef<T | null>(null);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	/**
	 * Perform the actual save operation
	 */
	const performSave = useCallback(async () => {
		if (!pendingDataRef.current) return;

		setState((prev) => ({ ...prev, isSaving: true, error: null }));

		try {
			await onSave(pendingDataRef.current);
			setState({
				isSaving: false,
				hasUnsavedChanges: false,
				lastSaved: new Date(),
				error: null,
			});
			pendingDataRef.current = null;
		} catch (error) {
			setState((prev) => ({
				...prev,
				isSaving: false,
				error: error instanceof Error ? error : new Error("Save failed"),
			}));
			// Don't clear pending data so user can retry
		}
	}, [onSave]);

	/**
	 * Save data with debouncing
	 */
	const save = useCallback(
		(data: T) => {
			if (!enabled) return;

			// Store the pending data
			pendingDataRef.current = data;

			// Mark as having unsaved changes
			setState((prev) => ({ ...prev, hasUnsavedChanges: true, error: null }));

			// Clear existing timeout
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// Set new timeout
			timeoutRef.current = setTimeout(() => {
				performSave();
			}, delay);
		},
		[delay, enabled, performSave],
	);

	/**
	 * Save immediately without debouncing
	 */
	const saveNow = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		performSave();
	}, [performSave]);

	/**
	 * Clear any pending saves
	 */
	const cancel = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		pendingDataRef.current = null;
		setState((prev) => ({ ...prev, hasUnsavedChanges: false }));
	}, []);

	return {
		save,
		saveNow,
		cancel,
		...state,
	};
}
