import { z } from 'zod'

export const candidateCreateSchema = z.object({
  name: z.string().min(2),
  electionId: z.string().min(1),
  party: z.string().optional(),
  age: z.number().int().positive().optional(),
  photoUrl: z.string().optional(),
  origin: z.string().optional(),
  education: z.string().optional(),
  bio: z.string().optional(),
  websiteUrl: z.string().optional(),
  governmentPlan: z
    .object({
      title: z.string().optional(),
      summary: z.string().optional(),
      url: z.string().optional(),
    })
    .optional(),
})

export const candidateUpdateSchema = candidateCreateSchema.partial()
