/**
 * Utility functions for URL construction
 */

export function constructCdnUrl(
  project: string, //project name
  tenant?: string //tenant id
): string {
  // Extract subdomain from project object or use project as subdomain string
  const subdomain =
    !!tenant && project.indexOf(tenant) !== -1
      ? project
      : `${project}-${tenant}`;

  // For now, we're not using tenant information in the URL construction,
  // but having it as a parameter allows for future flexibility
  return `https://${subdomain}.spa.godeploy.app`;
}
