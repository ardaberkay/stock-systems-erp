import { z } from 'zod';

// Ürün ekleme gibi toplu işler hemen sonuç vermez; önce bu numara döner.
export const batchRequestCreatedSchema = z.object({
  batchRequestId: z.string(),
});

const failedItemSchema = z.object({
  itemIndex: z.coerce.number().nullish(),
  error: z.string().nullish(),
  errorMsg: z.string().nullish(),
  // Tek hata nesne, birden fazla hata liste olarak geliyor
  errorList: z.unknown(),
});

const batchRequestSchema = z.object({
  batchRequestId: z.string(),
  // InProgress, Successful, SuccessfulPartially veya Failed
  status: z.string(),
  requestType: z.string().nullish(),
  // İş bitene kadar null gelir
  response: z
    .object({
      successItemCount: z.coerce.number().nullish(),
      failedItemCount: z.coerce.number().nullish(),
      successItemsDetails: z.array(z.coerce.number()).nullish(),
      failedItemsDetails: z.array(failedItemSchema).nullish(),
    })
    .nullish(),
});

export const batchRequestListSchema = z.object({
  data: z.array(batchRequestSchema),
});

export type BatchRequest = z.infer<typeof batchRequestSchema>;
export type BatchFailedItem = z.infer<typeof failedItemSchema>;
