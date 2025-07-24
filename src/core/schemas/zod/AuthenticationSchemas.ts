import { z } from 'zod';

export const defaultAuthenticateInformationSchema = z.object({
  email: z
    .string()
    .min(10, { message: '이메일은 10자 이상이어야 합니다.' })
    .max(30, { message: '이메일은 30자 이하이어야 합니다.' })
    .refine((email) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email), {
      message: '올바른 이메일 형식이 아닙니다.',
    })
    .refine((email) => !/[ㄱ-ㅎ가-힣]/.test(email), {
      message: '이메일에는 한글을 포함할 수 없습니다.',
    }),

  password: z
    .string()
    .min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
    .max(32, { message: '비밀번호는 32자 이하이어야 합니다.' })
    .refine((pw) => /[A-Za-z]/.test(pw), {
      message: '비밀번호에는 영문자가 최소 1자 이상 포함되어야 합니다.',
    })
    .refine((pw) => /\d/.test(pw), {
      message: '비밀번호에는 숫자가 최소 1자 이상 포함되어야 합니다.',
    })
    .refine((pw) => /[!@#$%^&*(),.?":{}|<>_\-\\[\]/~`+=;']/.test(pw), {
      message: '비밀번호에는 특수문자가 최소 1자 이상 포함되어야 합니다.',
    }),
});

export const authenticationSchema = defaultAuthenticateInformationSchema.extend({
  rememberMeStatus: z
    .union([z.boolean(), z.string()])
    .transform((value) => {
      if (typeof value === 'string') {
        return value === 'true';
      }
      return value;
    })
    .optional()
    .default(false),
});

export const detailRegisterUserSchema = defaultAuthenticateInformationSchema.extend({
  nickName: z
    .string()
    .min(2, { message: '별명은 2자 이상이어야 합니다.' })
    .max(10, { message: '별명은 10자 이하이어야 합니다.' })
    .regex(/^[가-힣a-zA-Z0-9]+$/, { message: '별명은 한글, 영어, 숫자만 사용할 수 있습니다.' }),
});
