import { describe, expect, it, mock } from 'bun:test'
import type { Project } from '../components/projects/projects.types.js'
import { ProjectDomain } from './url.js'

mock.module('nanoid', () => ({
  nanoid: mock(() => '-abc123---'),
}))

mock.module('random-word', () => ({
  default: mock(() => '--sunshine--'),
}))

describe('ProjectDomain', () => {
  const subdomain = 'abc123-sunshine'
  const domain = 'mycompany.org'

  describe('ProjectDomain.determine', () => {
    it('should use the subdomain if the domain is not present', () => {
      const pd = ProjectDomain.from({
        name: 'test-proj',
        subdomain,
      } as Project)
      expect(pd.determine()).toBe(pd.subdomain.origin)
    })
    it('should use the domain over subdomain if the domain is present', () => {
      const pd = ProjectDomain.from({
        name: 'test-proj',
        subdomain,
        domain,
      } as Project)
      expect(pd.determine()).toBe(pd.domain.origin)
    })
  })

  describe('ProjectDomain.domain', () => {
    it('should construct a url from the domain', () => {
      const result = ProjectDomain.from({
        name: 'test-proj',
        subdomain,
        domain,
      } as Project).domain.origin
      expect(result).toBe('https://' + domain)
    })
  })

  describe('ProjectDomain.subdomain', () => {
    it('should construct a url from subdomain', () => {
      const result = ProjectDomain.from({
        name: 'test-proj',
        subdomain,
      } as Project).subdomain.origin
      expect(result).toBe('https://abc123-sunshine.spa.godeploy.app')
    })
  })

  describe('ProjectDomain.storage', () => {
    it('should construct a storage key from subdomain', () => {
      const result = ProjectDomain.from({
        name: 'test-proj',
        subdomain,
      } as Project).storage.key
      expect(result).toBe('spa-projects/abc123-sunshine.spa.godeploy.app')
    })
  })

  describe('ProjectDomain.generate', () => {
    it('should generate a subdomain', () => {
      const result = ProjectDomain.generate.subdomain()
      expect(result).toBe('abc123-sunshine')
    })
  })
})
