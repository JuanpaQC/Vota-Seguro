import { z } from 'zod'

export const proposalCreateSchema = z.object({
  title: z.string().min(2),
  topic: z.string().min(2),
  candidateId: z.string().min(1),
  electionId: z.string().min(1),
  type: z.string().optional(),
  summary: z.string().optional(),
  detail: z.string().optional(),
  sourceUrl: z.string().optional(),
})

export const proposalUpdateSchema = proposalCreateSchema.partial()
