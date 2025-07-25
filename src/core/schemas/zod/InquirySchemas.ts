import { z } from 'zod';
import { InquiryCategory, InquirySearchOrderColumn } from '../../types/Enum';
import { pageRequestSchema } from './PageRequestSchma';

export const inquiryIdSchema = z.object({
  inquiryId: z
    .string()
    .transform((value) => Number(value))
    .refine((number: number) => !isNaN(number) && number > 0, {
      message: '고유 번호는 정수형식의 문자열이어야 합니다.',
    }),
});

export const inquiryCommentIdSchema = z.object({
  inquiryCommentId: z
    .string()
    .transform((value) => Number(value))
    .refine((number: number) => !isNaN(number) && number > 0, {
      message: '고유 번호는 정수형식의 문자열이어야 합니다.',
    }),
  inquiryId: z
    .string()
    .transform((value) => Number(value))
    .refine((number: number) => !isNaN(number) && number > 0, {
      message: '고유 번호는 정수형식의 문자열이어야 합니다.',
    }),
});

export const inquiryCommentReplyIdSchema = z.object({
  inquiryCommentReplyId: z
    .string()
    .transform((value) => Number(value))
    .refine((number: number) => !isNaN(number) && number > 0, {
      message: '고유 번호는 정수형식의 문자열이어야 합니다.',
    }),
});

export const inquirySearchRequestSchema = pageRequestSchema.extend({
  orderColumn: z
    .preprocess(
      (value) => (value === undefined ? 'createDateTime' : value),
      z.enum(InquirySearchOrderColumn).describe('정렬 기준')
    )
    .nullable()
    .optional(),

  title: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .string()
      .min(2)
      .describe('검색할 제목은 최소 2자리 이상이어야 합니다.')
      .nullable()
      .optional()
  ),

  answerStatus: z
    .preprocess(
      (value) => (typeof value === 'string' ? value === 'true' : value),
      z.boolean().describe('답변 여부').default(false)
    )
    .nullable()
    .optional(),
});

export const validateGuestPasswordSchema = z.object({
  validateGuestPassword: z
    .preprocess((value) => {
      if (typeof value === 'string') {
        return value === 'true';
      }
      return value;
    }, z.boolean())
    .nullable()
    .optional()
    .default(false),
});

export const detailSearchInquiryProcessTypeSchema =
  validateGuestPasswordSchema.extend({
    processType: z
      .preprocess((value) => {
        if (typeof value === 'string') {
          return value === 'true';
        }
        return value;
      }, z.boolean())
      .nullable()
      .optional()
      .default(false),
  });

export const guestPasswordSchema = z.object({
  guestPassword: z
    .union([
      z.string().length(4, { message: '비밀번호는 4자리여야 합니다.' }),
      z.null(),
    ])
    .optional(),
});

export const inquiryCreateSchema = guestPasswordSchema.extend({
  contentFormat: z
    .string()
    .min(4, { message: '컨텐츠 형식은 4자리 이상이어야 합니다.' })
    .max(10, { message: '컨텐츠 형식은 9자리 이하여야 합니다.' }),

  category: z.enum([
    InquiryCategory.TECH,
    InquiryCategory.REPORT,
    InquiryCategory.ETC,
  ]),

  title: z
    .string()
    .min(1, { message: '제목은 최소 1자리 이상이어야 합니다.' })
    .max(50, { message: '제목은 50자리 이하여야 합니다.' }),

  content: z
    .string()
    .min(10, { message: '내용은 최소 10자리 이상이어야 합니다.' })
    .max(100000, { message: '내용은 100,000자 이상 작성할 수 없습니다.' }),
});

export const inquiryUpdateSchema = z.object({
  contentFormat: z
    .string()
    .min(4, { message: '컨텐츠 형식은 4자리 이상이어야 합니다.' })
    .max(10, { message: '컨텐츠 형식은 9자리 이하여야 합니다.' }),

  category: z.enum([
    InquiryCategory.TECH,
    InquiryCategory.REPORT,
    InquiryCategory.ETC,
  ]),

  title: z
    .string()
    .min(1, { message: '제목은 최소 1자리 이상이어야 합니다.' })
    .max(50, { message: '제목은 50자리 이하여야 합니다.' }),

  content: z
    .string()
    .min(10, { message: '내용은 최소 10자리 이상이어야 합니다.' })
    .max(100000, { message: '내용은 100,000자 이상 작성할 수 없습니다.' }),
});

export const inquiryCommentSchema = z.object({
  content: z
    .string()
    .min(5, { message: '댓글 내용은 5자리 이상이어야 합니다.' })
    .max(100, { message: '댓글은 100자 이하여야 합니다.' }),
});

export const inquiryCommentParamRequestSchema = inquiryIdSchema.merge(
  inquiryCommentIdSchema
);

export const inquiryCommentReplyParamRequestSchema =
  inquiryCommentIdSchema.merge(inquiryCommentReplyIdSchema);

export const inquiryCommentSearchListRequestSchema =
  inquiryCommentIdSchema.merge(pageRequestSchema);

export const inquiryCommentRegisterRequestSchema = z.object({
  content: z
    .string()
    .min(5, { message: '댓글 내용은 5자리 이상이여야 합니다.' })
    .max(100, { message: '댓글 내용은 100자 이하여야 합니다.' }),
});

export const inquiryAnswerStatus = z.object({
  answerStatus: z
    .preprocess((value) => {
      if (typeof value === 'string') {
        return value === 'true';
      }
      return value;
    }, z.boolean())
    .nullable()
    .optional()
    .default(false),
});
