import { z } from 'zod';

// Adlar büyük harfle gelir (ADANA, ÇUKUROVA); siparişlere de aynı biçimde yazılır.
export const citySchema = z.object({
  id: z.coerce.number(),
  cityName: z.string(),
});

export const cityListSchema = z.object({
  data: z.array(citySchema),
});

export const districtSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  cityId: z.coerce.number(),
});

export const districtListSchema = z.object({
  data: z.array(districtSchema),
});

export type City = z.infer<typeof citySchema>;
export type District = z.infer<typeof districtSchema>;
