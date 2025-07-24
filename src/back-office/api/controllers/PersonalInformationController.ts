import { Request, Response, Router } from 'express';
import { validateRequest } from '../../../core/middlewares/ZodValidator';
import { DefaultResponse } from '../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../core/processor/CommonExceptionControllerResponseProcessor';
import { PersonalInformationService } from '../../../core/api/services/portfolio/PersonalInformationService';
import { PersonalInformationCreateRequestDto } from '../../../core/models/dtos/request/portfolio/personalInformation/PersonalInformationCreateRequestDto';
import { PersonalInformationCreateResponseDto } from '../../../core/models/dtos/response/portfolio/personalInformation/PersonalInformationCreateResponseDto';
import { PersonalInformationUpdateRequestDto } from '../../../core/models/dtos/request/portfolio/personalInformation/PersonalInformationUpdateRequestDto';
import { PersonalInformationUpdateResponseDto } from '../../../core/models/dtos/response/portfolio/personalInformation/PersonalInformationUpdateResponseDto';
import { PersonalInformationSchema } from '../../../core/schemas/zod/PersonalInformationSchemas';

export class PersonalInformationController {
  public readonly router: Router;
  private readonly personalInformationService: PersonalInformationService;

  constructor() {
    this.router = Router();
    this.personalInformationService = new PersonalInformationService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/portfolios/personal-information',
      validateRequest({
        body: PersonalInformationSchema,
      }),
      this.createPersonalInformation.bind(this)
    );

    this.router.patch(
      '/portfolios/personal-information',
      validateRequest({
        body: PersonalInformationSchema,
      }),
      this.updatePersonalInformation.bind(this)
    );
  }

  /**
   * @swagger
   * /api/portfolios/personal-information:
   *   post:
   *     summary: 포트폴리오 개인정보 작성
   *     description: 포트폴리오 개인정보를 작성합니다. 이미 생성된 개인정보가 있을 경우 작성할 수 없습니다.
   *     tags:
   *       - Portfolios
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: "이름"
   *                 example: "홍길동"
   *               birthDate:
   *                 type: string
   *                 description: "생년월일"
   *                 example: "1990-01-01"
   *               gender:
   *                 type: string
   *                 description: "성별 [남성, 여성]"
   *                 example: "남성"
   *               address:
   *                 type: string
   *                 description: "주소"
   *                 example: "서울시 강남구 역삼동"
   *               email:
   *                 type: string
   *                 description: "이메일"
   *                 example: "example@example.com"
   *               contact:
   *                 type: string
   *                 description: "전화번호"
   *                 example: "010-1234-5678"
   *     responses:
   *       200:
   *         description: "포트폴리오 개인정보 생성 성공"
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "포트폴리오 개인정보 생성 성공"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       description: "포트폴리오 개인정보 ID"
   *                       example: 42
   *       401:
   *         description: "인증되지 않은 사용자 (세션 없음 또는 만료)"
   *       403:
   *         description: "권한 없음 (관리자 아님)"
   *       404:
   *         description: "해당 문의글을 찾을 수 없음"
   *       500:
   *         description: "서버 내부 오류"
   */
  private async createPersonalInformation(request: Request, response: Response) {
    try {
      const personalInformationCreatedRequestDto = new PersonalInformationCreateRequestDto({
        name: request.body.name,
        birthDate: request.body.birthDate,
        gender: request.body.gender,
        address: request.body.address,
        email: request.body.email,
        contact: request.body.contact,
      });

      const result: DefaultResponse<PersonalInformationCreateResponseDto> =
        await this.personalInformationService.createPersonalInformation(
          personalInformationCreatedRequestDto
        );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `포트폴리오 개인정보 생성 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/portfolios/personal-information:
   *   patch:
   *     summary: 포트폴리오 개인정보 수정
   *     description: 포트폴리오 개인정보를 수정합니다.
   *     tags:
   *       - Portfolios
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: 이름
   *                 example: '김철수'
   *               birthDate:
   *                 type: string
   *                 description: 생년월일
   *                 example: '2000-03-03'
   *               gender:
   *                 type: string
   *                 description: 성별
   *                 example: '남성'
   *               address:
   *                 type: string
   *                 description: 주소
   *                 example: '서울시 종로구 종로3가'
   *               email:
   *                 type: string
   *                 description: 이메일
   *                 example: 'example2@example2.com'
   *               contact:
   *                 type: string
   *                 description: 전화번호
   *                 example: '010-4444-5555'
   *     responses:
   *       200:
   *         description: 포트폴리오 개인정보 수정 성공
   *         content:
   *           application/json:
   *             schema:
   *       401:
   *         description: "인증되지 않은 사용자 (세션 없음 또는 만료)"
   *       403:
   *         description: "권한 없음 (관리자 아님)"
   *       404:
   *         description: "해당 문의글을 찾을 수 없음"
   *       500:
   *         description: 서버 내부 오류
   */
  private async updatePersonalInformation(request: Request, response: Response) {
    try {
      const personalInformationUpdateRequestDto = new PersonalInformationUpdateRequestDto({
        name: request.body.name,
        birthDate: request.body.birthDate,
        gender: request.body.gender,
        address: request.body.address,
        email: request.body.email,
        contact: request.body.contact,
      });

      const result: DefaultResponse<PersonalInformationUpdateResponseDto> =
        await this.personalInformationService.updatePersonalInformation(
          personalInformationUpdateRequestDto
        );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `포트폴리오 개인정보 수정 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
