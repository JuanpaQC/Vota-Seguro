import { z } from 'zod'

export const reportCreateSchema = z.object({
  itemType: z.enum(['candidate', 'proposal', 'other']),
  itemId: z.string().optional(),
  electionId: z.string().optional(),
  reason: z.string().min(3),
  description: z.string().optional(),
  sourceUrl: z.string().optional(),
  status: z.enum(['pending', 'reviewed', 'dismissed']).optional(),
})

export const reportUpdateSchema = reportCreateSchema.partial()
