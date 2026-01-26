import { z } from 'zod'

export const electionCreateSchema = z.object({
  name: z.string().min(2),
  type: z.string().optional(),
  date: z.string().optional(),
  positions: z.array(z.string()).optional(),
  description: z.string().optional(),
  organizationId: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const electionUpdateSchema = electionCreateSchema.partial()
