/**
 * Utility functions for URL construction
 */
import { nanoid } from 'nanoid';
import randomWord from 'random-word';
import { StringFormatter } from './stringFormatter';

/**
 * Generates a unique, human-readable subdomain
 * Format: {nanoid}-{random word}
 * Example: "abc123-sunrise"
 * @returns A unique subdomain string
 */
export function generateUniqueSubdomain(): string {
  const id = nanoid(6); // Generate a 6-character unique ID
  const idWithoutDash = StringFormatter.from(id)
    .remove.trailing('-')
    .remove.leading('-')
    .toString();

  const word = StringFormatter.from(randomWord())
    .remove.trailing('-')
    .remove.leading('-')
    .toString();

  // Combine the ID and word with a dash
  return `${idWithoutDash}-${word}`;
}

/**
 * Constructs the CDN URL for a subdomain
 * This is the new implementation that uses the short subdomain only
 * @param subdomain The unique subdomain
 * @returns The full CDN URL
 */
export function constructCdnUrl(subdomain: string): string {
  return `https://${subdomain}.spa.godeploy.app`;
}

/**
 * Constructs the storage key for a subdomain
 * @param subdomain The unique subdomain
 * @returns The storage key path
 */
export function constructStorageKey(subdomain: string): string {
  return `spa-projects/${subdomain}.spa.godeploy.app`;
}
