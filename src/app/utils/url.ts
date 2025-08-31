/**
 * Utility functions for URL construction
 */
import { nanoid } from 'nanoid'
import randomWord from 'random-word'
import type { Project } from '../components/projects/projects.types'
import { StringFormatter } from './stringFormatter'

/**
 * Generates a unique, human-readable subdomain
 * Format: {nanoid}-{random word}
 * Example: "abc123-sunrise"
 * @returns A unique subdomain string
 */
export function generateUniqueSubdomain(): string {
  const id = nanoid(6) // Generate a 6-character unique ID
  const idWithoutDash = StringFormatter.from(id).remove.trailing('-').remove.leading('-').toString()

  const word = StringFormatter.from(randomWord()).remove.trailing('-').remove.leading('-').toString()

  // Combine the ID and word with a dash
  return `${idWithoutDash}-${word}`
}

/**
 * Constructs the CDN URL for a subdomain
 * This is the new implementation that uses the short subdomain only
 * @param subdomain The unique subdomain
 * @returns The full CDN URL
 */
export function constructCdnUrl(subdomain: string): string {
  return `https://${subdomain}.spa.godeploy.app`
}

export class UrlFormatter extends URL {
  constructor(url: string, base?: string) {
    super(url, base)
  }
  static from(uncleanUrl: string) {
    return new UrlFormatter(UrlFormatter.normalize.protocol(uncleanUrl))
  }
  static normalize = {
    protocol(url: string) {
      if (!url.startsWith('http')) return `https://${url}`
      return url
    },
  }
}

export class ProjectDomain {
  private project: Project
  constructor(project: Project) {
    this.project = project
  }

  static from = (project: Project) => new ProjectDomain(project)

  /*
   * determine() will determine which full origin url to use for the deployment based on if a custom domain has been configured
   */
  determine = () => (this.project.domain ? this.domain.origin : this.subdomain.origin)

  static SUBDOMAIN_HOST_AFFIX = 'spa.godeploy.app'

  static STORAGE_BUCKET = 'spa-projects'

  formatters = {
    subdomain: () => `${this.project.subdomain}.${ProjectDomain.SUBDOMAIN_HOST_AFFIX}`,
  }
  get subdomain(): UrlFormatter {
    return UrlFormatter.from(this.formatters.subdomain())
  }

  get domain(): UrlFormatter {
    return UrlFormatter.from(this.project.domain as string)
  }

  get storage(): { key: string } {
    return {
      key: this.project.domain
        ? `${ProjectDomain.STORAGE_BUCKET}/${this.domain.host}`
        : `${ProjectDomain.STORAGE_BUCKET}/${this.subdomain.host}`,
    }
  }

  //static creation utils for projects
  static generate = {
    subdomain: () => generateUniqueSubdomain(),
  }
}
