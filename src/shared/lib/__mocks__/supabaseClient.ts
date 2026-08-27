import { vi } from 'vitest'

export const supabase = {
  from: vi.fn(),
  functions: { invoke: vi.fn() },
}