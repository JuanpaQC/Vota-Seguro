import { z } from 'zod'

export const interviewCreateSchema = z.object({
  candidateId: z.string().min(1),
  electionId: z.string().min(1),
  description: z.string().min(2),
  photoUrl: z.string().url().optional(),
  interviewUrl: z.string().url(),
})

export const interviewUpdateSchema = interviewCreateSchema.partial()
