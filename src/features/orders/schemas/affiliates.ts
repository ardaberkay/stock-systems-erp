import { z } from 'zod';

export const affiliateSchema = z.object({
  id: z.coerce.number(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  officeName: z.string().nullish(),
  phone: z.string().nullish(),
  status: z.coerce.number(),
});

export const affiliateListSchema = z.object({
  data: z.array(affiliateSchema),
});

export type Affiliate = z.infer<typeof affiliateSchema>;
