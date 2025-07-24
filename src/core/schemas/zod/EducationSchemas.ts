import { z } from 'zod';

export const EducationSchema = z.object({
  schoolName: z
    .string()
    .min(1, { message: '학교명은 최소 1자리 이상이어야 합니다.' })
    .max(100, { message: '학교명은 100자리 이하여야 합니다.' }),
  major: z
    .string()
    .min(1, { message: '전공은 최소 1자리 이상이어야 합니다.' })
    .max(100, { message: '전공은 100자리 이하여야 합니다.' }),
  degree: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value || value.trim() === '') return true; // 빈 값 허용
        return value.length >= 1 && value.length <= 200;
      },
      { message: '학위는 1자리 이상 200자리 이하여야 합니다.' }
    ),
  startDate: z
    .string()
    .min(1, { message: '입학일을 입력해주세요.' })
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
      },
      { message: '유효한 입학일을 입력해주세요.' }
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
      { message: '유효한 졸업일을 입력해주세요.' }
    ),
});

export const EducationIdSchema = z.object({
  educationId: z
    .string()
    .min(1, { message: '학력 ID는 필수입니다.' })
    .refine((value) => !isNaN(Number(value)) && Number(value) > 0, {
      message: '유효한 학력 ID를 입력해주세요.',
    }),
});
