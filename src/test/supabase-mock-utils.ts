import { vi } from 'vitest'

type ResolvedValue = { data: unknown; error: unknown }

export function makeQueryBuilder(resolvedValue: ResolvedValue, delayMs = 0) {
  const builder: Record<string, unknown> = {}
  const chainable = ['select', 'order', 'eq', 'match', 'insert', 'upsert'] as const

  for (const method of chainable) {
    builder[method] = vi.fn(() => builder)
  }

  builder.single = vi.fn(() => resolveAfter(resolvedValue, delayMs))
  builder.maybeSingle = vi.fn(() => resolveAfter(resolvedValue, delayMs))

    builder.then = (
    onResolve: (v: ResolvedValue) => void,
    onReject?: (e: unknown) => void
  ) => resolveAfter(resolvedValue, delayMs).then(onResolve, onReject)

  return builder
}

export function makeTableRouter(builders: Record<string, unknown>) {
  return (table: string) => {
    const builder = builders[table]
    if (!builder) throw new Error(`No mock query builder configured for table: ${table}`)
    return builder
  }
}

function resolveAfter(value: ResolvedValue, delayMs: number): Promise<ResolvedValue> {
  if (delayMs <= 0) return Promise.resolve(value)
  return new Promise((resolve) => setTimeout(() => resolve(value), delayMs))
}