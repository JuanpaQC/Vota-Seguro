import { z } from 'zod'

const proposalInputSchema = z.object({
  title: z.string().min(2),
  topic: z.string().min(2),
  type: z.string().optional(),
  summary: z.string().optional(),
  detail: z.string().optional(),
  sourceUrl: z.string().optional(),
})

const candidateInputSchema = z.object({
  name: z.string().min(2),
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
  proposals: z.array(proposalInputSchema).optional(),
})

export const electionCreateSchema = z.object({
  name: z.string().min(2),
  type: z.string().optional(),
  mode: z.string().optional(),
  date: z.string().optional(),
  positions: z.array(z.string()).optional(),
  description: z.string().optional(),
  organizationId: z.string().optional(),
  organizationName: z.string().optional(),
  isActive: z.boolean().optional(),
  candidates: z.array(candidateInputSchema).optional(),
})

export const electionUpdateSchema = electionCreateSchema
  .omit({ candidates: true })
  .partial()
