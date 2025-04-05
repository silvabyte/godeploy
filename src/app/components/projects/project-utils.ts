import type { Result } from '../../types/result.types';
import slugify from 'slugify';
import { constructCdnUrl } from '../../utils/urlUtils';
import type { Project } from './projects.types';

export interface ProjectNameValidation {
  name: string;
  subdomain: string;
}

/**
 * Validates and transforms a project name
 * - Removes trailing dashes
 * - Checks minimum length
 * - Generates subdomain
 */
export function validateAndTransformProjectName(
  rawName: string
): Result<ProjectNameValidation> {
  if (!rawName) {
    return {
      error: 'Project name is required',
      data: null,
    };
  }

  // Remove trailing dashes
  let name = rawName;
  while (name.endsWith('-')) {
    name = name.slice(0, -1);
  }

  // Check minimum length
  if (name.length < 3) {
    return {
      error: 'Project name is too short. Min 3 characters',
      data: null,
    };
  }

  // Generate subdomain
  const subdomain = slugify(name, {
    lower: true,
    strict: true,
  });

  return {
    error: null,
    data: {
      name,
      subdomain,
    },
  };
}

/**
 * Adds CDN URL to a project or list of projects
 */
export function addUrlToProject(
  project: Project,
  tenantId: string
): Project & { url: string };
export function addUrlToProject(
  projects: Project[],
  tenantId: string
): (Project & { url: string })[];
export function addUrlToProject(
  projectOrProjects: Project | Project[],
  tenantId: string
): (Project & { url: string }) | (Project & { url: string })[] {
  if (Array.isArray(projectOrProjects)) {
    return projectOrProjects.map((project) => ({
      ...project,
      url: constructCdnUrl(project.subdomain, tenantId),
    }));
  }

  return {
    ...projectOrProjects,
    url: constructCdnUrl(projectOrProjects.subdomain, tenantId),
  };
}
