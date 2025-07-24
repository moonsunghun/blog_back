import { Request, Response, Router } from 'express';
import { DefaultResponse } from '../../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../../core/processor/CommonExceptionControllerResponseProcessor';
import { PersonalInformationService } from '../../../../core/api/services/portfolio/PersonalInformationService';

export class PersonalInformationController {
  public readonly router: Router;
  private readonly personalInformationService: PersonalInformationService;

  constructor() {
    this.router = Router();
    this.personalInformationService = new PersonalInformationService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/portfolios/personal-information', this.getPersonalInformation.bind(this));
  }

  /**
   * @swagger
   * /api/portfolios/personal-information:
   *   get:
   *     summary: 포트폴리오 개인정보 조회
   *     description: 포트폴리오 개인정보를 조회합니다.
   *     tags:
   *       - Portfolios
   *     responses:
   *       200:
   *         description: "포트폴리오 개인정보 조회 성공"
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 statusCode:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "포트폴리오 개인정보 조회 성공"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       description: "포트폴리오 개인정보 ID"
   *                       example: 42
   *                     name:
   *                       type: string
   *                       description: "이름"
   *                       example: "홍길동"
   *                     birthDate:
   *                       type: string
   *                       description: "생년월일"
   *                       example: "1990-01-01"
   *                     gender:
   *                       type: string
   *                       description: "성별 [남성, 여성]"
   *                       example: "남성"
   *                     address:
   *                       type: string
   *                       description: "주소"
   *                       example: "서울시 강남구 역삼동"
   *                     email:
   *                       type: string
   *                       description: "이메일"
   *                       example: "example@example.com"
   *                     contact:
   *                       type: string
   *                       description: "전화번호"
   *                       example: "010-1234-5678"
   *       401:
   *         description: "인증되지 않은 사용자 (세션 없음 또는 만료)"
   *       403:
   *         description: "권한 없음 (관리자 아님)"
   *       404:
   *         description: "해당 문의글을 찾을 수 없음"
   *       500:
   *         description: "서버 내부 오류"
   */
  private async getPersonalInformation(request: Request, response: Response) {
    try {
      const result = await this.personalInformationService.getPersonalInformation();

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `포트폴리오 개인정보 조회 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
