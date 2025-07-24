import { z } from 'zod';
import { pageRequestSchema } from './PageRequestSchma';

export const blogSearchSchema = pageRequestSchema.extend({
  title: z.string().min(2, { message: '검색조건은 2자 이상이어야 합니다.' }).optional(),
});
export const blogIdSchema = z.object({
  blogId: z
    .string()
    .transform(Number)
    .refine((number: number) => !isNaN(number) && number > 0, {
      message: '고유 번호는 정수형식의 문자열이어야 합니다.',
    }),
});

export const detailSearchBlogProcessTypeSchema = z.object({
  processType: z
    .preprocess((value) => {
      if (typeof value === 'string') {
        return value === 'true';
      }
      return value;
    }, z.boolean())
    .optional()
    .default(false),
});

export const blogCommentSchema = z.object({
  content: z
    .string()
    .min(5, { message: '댓글 내용은 5자리 이상이어야 합니다.' })
    .max(100, { message: '댓글은 100자 이하여야 합니다.' }),
  userId: z.number().optional(),
});

export const blogRegisterSchema = z.object({
  userId: z.number().optional(),
  title: z
    .string()
    .min(1, { message: '제목은 최소 1자리 이상이어야 합니다.' })
    .max(100, { message: '제목은 100자리 이하여야 합니다.' }),
  preview: z.string().max(200).optional(),
  content: z
    .string()
    .min(10, { message: '내용은 최소 10자리 이상이어야 합니다.' })
    .max(10000000, { message: '내용은 100,000자 이상 작성할 수 없습니다.' }),
  contentSummary: z.string().optional(),
  category: z.string().max(10).optional(),
  contentEnglish: z.string().max(10000000).optional(),
});

export const blogUpdateSchema = z.object({
  title: z
    .string()
    .min(1, { message: '제목은 최소 1자리 이상이어야 합니다.' })
    .max(100, { message: '제목은 100자리 이하여야 합니다.' }),
  preview: z.string().max(200).optional(),
  content: z
    .string()
    .min(10, { message: '내용은 최소 10자리 이상이어야 합니다.' })
    .max(100000, { message: '내용은 100,000자 이상 작성할 수 없습니다.' }),
  contentSummary: z.string().optional(),
  category: z.string().max(10).optional(),
});

export const blogCommentIdSchema = z.object({
  blogCommentId: z
    .string()
    .transform((value) => Number(value))
    .refine((number: number) => !isNaN(number) && number > 0, {
      message: '고유 번호는 정수형식의 문자열이어야 합니다.',
    }),
});

export const blogCommentParamRequestSchema = blogIdSchema.merge(blogCommentIdSchema);

export const blogCommentRegisterRequestSchema = z.object({
  content: z
    .string()
    .min(5, { message: '댓글 내용은 5자리 이상이여야 합니다.' })
    .max(100, { message: '댓글 내용은 100자 이하여야 합니다.' }),
});

export const blogCommentSearchListRequestSchema = blogCommentIdSchema.merge(pageRequestSchema);

export const blogCommentReplyRegisterRequestSchema = z.object({
  content: z
    .string()
    .min(5, { message: '댓글 내용은 5자리 이상이여야 합니다.' })
    .max(100, { message: '댓글 내용은 100자 이하여야 합니다.' }),
  userId: z.number().optional(),
});

export const blogCommentReplyIdSchema = z.object({
  blogCommentReplyId: z
    .string()
    .transform((value) => Number(value))
    .refine((number: number) => !isNaN(number) && number > 0, {
      message: '고유 번호는 정수형식의 문자열이어야 합니다.',
    }),
});

export const blogCommentReplyParamRequestSchema =
  blogCommentIdSchema.merge(blogCommentReplyIdSchema);
