import type { Result } from '../../types/result.types';
import { ProjectDomain } from '../../utils/url';
import { StringFormatter } from '../../utils/stringFormatter';
import type { Project } from './projects.types';

export interface ProjectNameValidation {
  name: string;
  subdomain: string;
}

/**
 * Validates and transforms a project name
 * - Removes trailing dashes
 * - Checks minimum length
 * - Generates a unique subdomain using nanoid + random word
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

  const name = StringFormatter.from(rawName)
    .remove.trailing('-')
    .remove.leading('-')
    .toString();

  // Check minimum length
  if (name.length < 3) {
    return {
      error: 'Project name is too short. Min 3 characters',
      data: null,
    };
  }

  // Generate unique subdomain
  const subdomain = ProjectDomain.generate.subdomain();

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
export function addUrlToProject(project: Project): Project & { url: string };

export function addUrlToProject(
  projects: Project[]
): (Project & { url: string })[];

export function addUrlToProject(
  projectOrProjects: Project | Project[]
): (Project & { url: string }) | (Project & { url: string })[] {
  if (Array.isArray(projectOrProjects)) {
    return projectOrProjects.map((project) => ({
      ...project,
      url: ProjectDomain.from(project).determine(),
    }));
  }

  return {
    ...projectOrProjects,
    url: ProjectDomain.from(projectOrProjects).determine(),
  };
}
