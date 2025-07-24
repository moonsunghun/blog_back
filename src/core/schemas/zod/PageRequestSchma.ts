import { z } from 'zod';
import { OrderBy } from '../../types/Enum';

export const pageRequestSchema = z.object({
  pageNumber: z
    .preprocess(
      (value) => (value === undefined ? 1 : Number(value)),
      z.number().int().min(1).describe('페이지 번호 (기본값: 1)')
    )
    .nullable()
    .optional(),

  perPageSize: z
    .preprocess(
      (value) => (value === undefined ? 10 : Number(value)),
      z.number().int().min(1).describe('페이지당 항목 수 (기본값: 10)')
    )
    .nullable()
    .optional(),

  orderBy: z
    .preprocess(
      (value) => {
        if (typeof value === 'string') return value.toUpperCase();
        return value ?? OrderBy.DESC;
      },
      z.enum(Object.values(OrderBy) as [string, ...string[]]).describe('정렬 방향')
    )
    .nullable()
    .optional(),
});
