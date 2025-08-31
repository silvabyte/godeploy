import { describe, it, expect } from 'bun:test';
import {
  validateAndTransformProjectName,
  addUrlToProject,
} from './project-utils.js';
import type { Project } from './projects.types.js';

describe('validateAndTransformProjectName', () => {
  it('returns error when no name is provided', () => {
    const result = validateAndTransformProjectName('');
    expect(result.error).toBe('Project name is required');
    expect(result.data).toBeNull();
  });

  it('removes trailing dashes and returns name and subdomain', () => {
    const result = validateAndTransformProjectName('--my-project---');
    expect(result.error).toBeNull();
    expect(result.data?.name).toBe('my-project');
    expect(result.data?.subdomain).toBeDefined();
  });

  it('returns error if name is less than 3 characters after cleaning', () => {
    const result = validateAndTransformProjectName('ab-');
    expect(result.error).toBe('Project name is too short. Min 3 characters');
    expect(result.data).toBeNull();
  });
});

describe('addUrlToProject', () => {
  const mockProject = {
    id: '1',
    name: 'Test',
    subdomain: 'test123',
  } as Project;

  it('adds a url to a single project', () => {
    const result = addUrlToProject(mockProject);
    expect(result.url).toContain(mockProject.subdomain);
  });

  it('adds a url to an array of projects', () => {
    const result = addUrlToProject([mockProject, mockProject]);
    expect(result.length).toBe(2);
    for (const proj of result) {
      expect(proj.url).toContain(mockProject.subdomain);
    }
  });
});
