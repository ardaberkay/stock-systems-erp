import { z } from 'zod';

export const affiliateSchema = z.object({
  id: z.coerce.number(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  officeName: z.string().nullish(),
  phone: z.string().nullish(),
  email: z.string().nullish(),
  // Paneldeki "kesinti durumu" (1 / 0); API yalnızca okuyor
  subtractionStatus: z.coerce.number().nullish(),
  status: z.coerce.number(),
  // 'YYYY-MM-DD HH:MM:SS'
  createTime: z.string().nullish(),
});

export const affiliateListSchema = z.object({
  data: z.array(affiliateSchema),
});

export type Affiliate = z.infer<typeof affiliateSchema>;
