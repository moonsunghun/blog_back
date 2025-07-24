import { z } from 'zod';

export const CareerSchema = z.object({
  companyName: z
    .string()
    .min(1, { message: '회사명은 최소 1자리 이상이어야 합니다.' })
    .max(100, { message: '회사명은 100자리 이하여야 합니다.' }),
  position: z
    .string()
    .min(1, { message: '직급은 최소 1자리 이상이어야 합니다.' })
    .max(100, { message: '직급은 100자리 이하여야 합니다.' }),
  startDate: z
    .string()
    .min(1, { message: '입사일을 입력해주세요.' })
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
      },
      { message: '유효한 입사일을 입력해주세요.' }
    ),
  endDate: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date) return true; // optional이므로 빈 값 허용
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
      },
      { message: '유효한 퇴사일을 입력해주세요.' }
    ),
});

export const CareerIdSchema = z.object({
  careerId: z
    .string()
    .min(1, { message: '경력 ID는 필수입니다.' })
    .refine((value) => !isNaN(Number(value)) && Number(value) > 0, {
      message: '유효한 경력 ID를 입력해주세요.',
    }),
});
