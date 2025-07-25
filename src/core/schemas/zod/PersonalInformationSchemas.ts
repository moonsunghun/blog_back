import { z } from 'zod';
import { PersonalInformationGender } from '../../types/Enum';

export const PersonalInformationSchema = z.object({
  name: z
    .string()
    .min(1, { message: '이름은 최소 1자리 이상이어야 합니다.' })
    .max(50, { message: '이름은 50자리 이하여야 합니다.' }),
  birthDate: z
    .string()
    .min(1, { message: '생년월일을 입력해주세요.' })
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
      },
      { message: '유효한 생년월일을 입력해주세요.' }
    ),
  gender: z.enum(
    [PersonalInformationGender.MALE, PersonalInformationGender.FEMALE],
    {}
  ),
  address: z
    .string()
    .min(1, { message: '주소는 최소 1자리 이상이어야 합니다.' })
    .max(100, { message: '주소는 100자리 이하여야 합니다.' }),
  email: z
    .string()
    .email({ message: '이메일 형식이 올바르지 않습니다.' })
    .max(100, { message: '이메일은 100자리 이하여야 합니다.' }),
  contact: z
    .string()
    .min(1, { message: '전화번호는 최소 1자리 이상이어야 합니다.' })
    .max(100, { message: '전화번호는 20자리 이하여야 합니다.' })
    .refine(
      (phone) => {
        // 한국 전화번호 형식 검증 (010-1234-5678, 02-123-4567, 031-123-4567 등)
        const phoneRegex =
          /^(01[016789]|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/;
        return phoneRegex.test(phone);
      },
      { message: '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)' }
    ),
});
