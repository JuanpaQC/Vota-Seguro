import { z } from 'zod'

// 1) Schema base SIN refinements (esto permite usar .partial())
const reportBaseSchema = z.object({
  itemType: z.enum(['candidate', 'proposal', 'other']),
  itemId: z.string().optional(),
  electionId: z.string().optional(),
  reason: z.string().min(3),
  description: z.string().optional(),
  sourceUrl: z.string().optional(),
  status: z.enum(['pending', 'reviewed', 'dismissed']).optional(),
})

// 2) CREATE: aplica la regla de itemId cuando corresponde
export const reportCreateSchema = reportBaseSchema.superRefine((data, ctx) => {
  if ((data.itemType === 'candidate' || data.itemType === 'proposal') && !data.itemId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['itemId'],
      message: 'itemId es requerido cuando itemType es candidate o proposal',
    })
  }
})

// 3) UPDATE: partial SIN refinements (para que no truene Zod v4)
export const reportUpdateSchema = reportBaseSchema.partial()
