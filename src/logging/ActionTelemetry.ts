import { flatten } from 'flat'
import type { Logger } from '../app/log'

export class ActionTelemetry {
  constructor(private readonly telemetry: Logger) {}

  startEntry?: { operation: string; start: Date; data: unknown }
  endEntry?: {
    end: Date
    data: unknown
    status: 'success' | 'failure'
    error?: unknown
  }
  actions: {
    label: string
    data: unknown
  }[] = []

  payload?: {
    operation: string
    start: Date
    end: Date
    duration: number

    actions: {
      label: string
      data: unknown
    }[]
    operationStatus: 'success' | 'failure'
  }

  New() {
    return new ActionTelemetry(this.telemetry)
  }

  start(operation: string, metadata?: unknown) {
    metadata ??= {}
    const flattenedData = flatten(metadata, {
      delimiter: '_',
    })
    this.startEntry = {
      operation,
      start: new Date(),
      data: flattenedData,
    }
    return this
  }
  add(action: string, data?: unknown) {
    data ??= {}
    const flattenedData = flatten(data, {
      delimiter: '_',
    })
    this.actions.push({
      label: action,
      data: flattenedData,
    })
    return this
  }

  success(data?: unknown) {
    data ??= {}
    const flattenedData = flatten(data, {
      delimiter: '_',
    })
    this.endEntry = {
      end: new Date(),
      data: flattenedData,
      status: 'success',
    }
    return this.process().send()
  }

  failure(error: unknown, data?: unknown) {
    data ??= {}
    const flattenedData = flatten(data, {
      delimiter: '_',
    })
    this.endEntry = {
      end: new Date(),
      data: flattenedData,
      error,
      status: 'failure',
    }
    return this.process().send()
  }

  process() {
    if (!this.startEntry || !this.endEntry) {
      return this
    }

    const start = this.startEntry
    const actions = this.actions
    const end = this.endEntry
    const duration = end.end.getTime() - start.start.getTime()

    const telemetryData = {
      ...start,
      actions,
      ...end,
      ...(start?.data || {}),
      ...(end?.data ? { data: end.data } : {}),
      duration,
      operationStatus: end.status,
    }

    this.payload = telemetryData
    return this
  }
  send() {
    const telemetry = this.telemetry
    if (!this.payload) {
      return this
    }
    telemetry.info(this.payload, this.payload.operation)
    return this
  }
}
