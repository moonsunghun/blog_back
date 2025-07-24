import { z } from 'zod';

/**
 * 사용자 세션 유효성 검사 스키마
 * 마이페이지 조회 시 userId 파라미터 검증용
 */
export const userSessionValidationSchema = z.object({
  // 로그인 기능 구현 후 세션에 있는 아이디 값으로 유효성 검사 추가 예정
});

/**
 * 별명 수정 스키마
 */
export const nickNameUpdateSchema = z.object({
  nickName: z
    .string()
    .min(2, { message: '별명은 2자 이상이어야 합니다.' })
    .max(10, { message: '별명은 10자 이하이어야 합니다.' })
    .regex(/^[가-힣a-zA-Z0-9]+$/, { message: '별명은 한글, 영어, 숫자만 사용할 수 있습니다.' }),
});

/**
 * 비밀번호 수정 스키마
 */
export const passwordUpdateSchema = z.object({
  currentPassword: z
    .string()
    .min(8, { message: '현재 비밀번호는 최소 8자 이상이어야 합니다.' })
    .max(32, { message: '현재 비밀번호는 32자 이하이어야 합니다.' }),
  newPassword: z
    .string()
    .min(8, { message: '새 비밀번호는 최소 8자 이상이어야 합니다.' })
    .max(32, { message: '새 비밀번호는 32자 이하이어야 합니다.' })
    .refine((pw) => /[A-Za-z]/.test(pw), {
      message: '새 비밀번호에는 영문자가 최소 1자 이상 포함되어야 합니다.',
    })
    .refine((pw) => /\d/.test(pw), {
      message: '새 비밀번호에는 숫자가 최소 1자 이상 포함되어야 합니다.',
    })
    .refine((pw) => /[!@#$%^&*(),.?":{}|<>_\-\\[\]/~`+=;']/.test(pw), {
      message: '새 비밀번호에는 특수문자가 최소 1자 이상 포함되어야 합니다.',
    }),
  newPasswordConfirm: z
    .string()
    .min(8, { message: '비밀번호 확인은 최소 8자 이상이어야 합니다.' })
    .max(32, { message: '비밀번호 확인은 32자 이하이어야 합니다.' }),
});

/**
 * 회원 탈퇴 스키마
 */
export const userWithdrawSchema = z.object({
  password: z
    .string()
    .min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
    .max(32, { message: '비밀번호는 32자 이하이어야 합니다.' }),
});

/**
 * 회원 정보 조회 스키마
 */
export const userListSearchSchema = z.object({
  pageNumber: z
    .string()
    .regex(/^[0-9]+$/)
    .transform(Number)
    .optional()
    .default('1'),
  perPageSize: z
    .string()
    .regex(/^[0-9]+$/)
    .transform(Number)
    .optional()
    .default('10'),
  orderBy: z.enum(['ASC', 'DESC']).optional().default('DESC'),
  orderColumn: z
    .enum(['email', 'nickName', 'blockState', 'createDateTime'])
    .optional()
    .default('createDateTime'),
  email: z.string().optional(),
  nickName: z.string().optional(),
  blockState: z
    .union([z.boolean(), z.string().regex(/^(true|false)$/)])
    .transform((v) => (typeof v === 'string' ? v === 'true' : v))
    .optional(),
});
