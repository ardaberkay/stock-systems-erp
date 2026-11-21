import { z } from 'zod';

export const cargoCompanySchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  fullName: z.string().nullish(),
  status: z.coerce.number(),
});

export type CargoCompany = z.infer<typeof cargoCompanySchema>;

export const cargoCompanyListSchema = z.object({
  data: z.array(cargoCompanySchema),
});
