import { z } from 'zod';

export const portfolioIdSchema = z.object({
  portfolioId: z
    .string()
    .transform(Number)
    .refine((number: number) => !isNaN(number) && number > 0, {
      message: '고유 번호는 정수형식의 문자열이어야 합니다.',
    }),
});

export const portfolioRegisterSchema = z.object({
  title: z
    .string()
    .min(1, { message: '제목은 최소 1자리 이상이어야 합니다.' })
    .max(150, { message: '제목은 150자리 이하여야 합니다.' }),

  contentFormat: z
    .string()
    .min(4, { message: '컨텐츠 형식은 4자리 이상이어야 합니다.' })
    .max(10, { message: '컨텐츠 형식은 9자리 이하여야 합니다.' }),

  content: z
    .string()
    .min(10, { message: '내용은 최소 10자리 이상이어야 합니다.' })
    .max(100000, { message: '내용은 100,000자 이상 작성할 수 없습니다.' }),
});

export const portfolioUpdateSchema = z.object({
  title: z
    .string()
    .min(1, { message: '제목은 최소 1자리 이상이어야 합니다.' })
    .max(150, { message: '제목은 150자리 이하여야 합니다.' }),

  contentFormat: z
    .string()
    .min(4, { message: '컨텐츠 형식은 4자리 이상이어야 합니다.' })
    .max(10, { message: '컨텐츠 형식은 9자리 이하여야 합니다.' }),

  content: z
    .string()
    .min(10, { message: '내용은 최소 10자리 이상이어야 합니다.' })
    .max(100000, { message: '내용은 100,000자 이상 작성할 수 없습니다.' }),
});
