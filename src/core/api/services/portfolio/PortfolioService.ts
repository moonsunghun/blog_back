import { Portfolio } from '../../../models/entities/portfolio/Portfolio';
import { PortfolioCreateRequestDto } from '../../../models/dtos/request/portfolio/PortfolioCreateRequestDto';
import { PortfolioUpdateRequestDto } from '../../../models/dtos/request/portfolio/PortfolioUpdateRequestDto';
import { DefaultResponse } from '../../../constant/DefaultResponse';
import { PortfolioCreateResponseDto } from '../../../models/dtos/response/portfolio/PortfolioCreateResponseDto';
import { PortfolioUpdateResponseDto } from '../../../models/dtos/response/portfolio/PortfolioUpdateResponseDto';
import { PortfolioListResponseDto } from '../../../models/dtos/response/portfolio/PortfolioListResponseDto';
import { PortfolioSetMainRequestDto } from '../../../models/dtos/request/portfolio/PortfolioSetMainRequestDto';
import { PortfolioSetMainResponseDto } from '../../../models/dtos/response/portfolio/PortfolioSetMainResponseDto';
import { HttpExceptionResponse } from '../../exception/HttpExceptionResponse';
import { logger } from '../../../utilities/Logger';
import { PortfolioRepository } from '../../repositories/portfolio/PortfolioRepository';
import { PortfolioRepositoryImpl } from '../../repositories/implements/portfolio/PortfolioRepositoryImpl';
import { Page } from '../../../constant/Page';
import { PageRequestDto } from '../../../models/dtos/request/PageRequestDto';
import { PortfolioDetailRequestDto } from '../../../models/dtos/request/portfolio/PortfolioDetailRequestDto';
import { PortfolioDetailResponseDto } from '../../../models/dtos/response/portfolio/PortfolioDetailResponseDto';

/**
 * 포트폴리오 서비스 로직을 담당하는 클래스입니다.
 *
 * 이 클래스는 포트폴리오 등록 기능을 제공합니다.
 * 데이터베이스 접근은 PortfolioRepository를 통해 수행됩니다.
 *
 * 주요 기능:
 * - createPortfolio: 포트폴리오 생성
 * - updatePortfolio: 포트폴리오 수정
 * - deletePortfolio: 포트폴리오 삭제
 *
 * 주의사항:
 */
export class PortfolioService {
  private readonly portfolioRepository: PortfolioRepository = new PortfolioRepositoryImpl();

  /**
   * 포트폴리오를 생성합니다.
   * 기존에 작성된 포트폴리오가 하나도 없을 경우 새로 작성한 포트폴리오는 자동으로 메인 포트폴리오로 설정됩니다.
   * 새로운 메인 포트폴리오가 생성될 경우 기존의 모든 메인 포트폴리오는 false로 변경됩니다.
   *
   * @param portfolioCreateRequestDto 포트폴리오 생성 요청 DTO
   * @returns 생성된 포트폴리오 ID
   *
   * @throws Error 포트폴리오 저장 실패 시 예외 발생
   */
  async createPortfolio(
    portfolioCreatedRequestDto: PortfolioCreateRequestDto
  ): Promise<DefaultResponse<PortfolioCreateResponseDto>> {
    const existingPortfolioCount = await this.portfolioRepository.count();
    const entity = portfolioCreatedRequestDto.toEntity(portfolioCreatedRequestDto);
    entity.mainState = existingPortfolioCount === 0;

    const portfolioId: number = await this.portfolioRepository.save(entity);

    if (!portfolioId || portfolioId <= 0) {
      throw new HttpExceptionResponse(500, '포트폴리오 등록 실패 데이터 베이스 문제 발생');
    }

    const createdPortfolio = await this.portfolioRepository.findById(portfolioId);
    const mainState = createdPortfolio?.mainState || false;

    return DefaultResponse.responseWithData(
      201,
      '포트폴리오 생성 성공',
      new PortfolioCreateResponseDto(portfolioId, mainState)
    );
  }

  /**
   * 포트폴리오를 수정합니다.
   * 전달받은 포트폴리오 ID로 기존 포트폴리오를 조회 후 엔티티를 업데이트 합니다.
   *
   * @param portfolioId 수정할 포트폴리오 ID
   * @param portfolioUpdateRequestDto 포트폴리오 수정 요청 DTO
   * @returns 수정된 포트폴리오 정보
   *
   * @throws Error 포트폴리오 수정 실패 시 예외 발생
   */
  async updatePortfolio(
    portfolioUpdateRequestDto: PortfolioUpdateRequestDto
  ): Promise<DefaultResponse<PortfolioUpdateResponseDto>> {
    const portfolio: Portfolio = await this.portfolioRepository.update(
      this.checkPortfolio(
        await this.portfolioRepository.findById(portfolioUpdateRequestDto.portfolioId)
      ),
      portfolioUpdateRequestDto.toEntity(portfolioUpdateRequestDto)
    );

    return DefaultResponse.responseWithData(
      200,
      '포트폴리오 수정 성공',
      new PortfolioUpdateResponseDto(portfolio.id)
    );
  }

  /**
   * 포트폴리오를 삭제합니다.
   * 전달받은 포트폴리오 ID로 기존 포트폴리오를 조회 후 삭제합니다.
   * 메인 포트폴리오는 삭제할 수 없습니다.
   *
   * @param portfolioId 삭제할 포트폴리오 ID
   * @returns 삭제된 포트폴리오 ID
   *
   * @throws Error 포트폴리오 삭제 실패 시 예외 발생
   * @throws HttpExceptionResponse 메인 포트폴리오 삭제 시도 시 예외 발생
   */
  async deletePortfolio(portfolioId: number): Promise<DefaultResponse<{ id: number }>> {
    try {
      const portfolio: Portfolio = this.checkPortfolio(
        await this.portfolioRepository.findById(portfolioId)
      );

      if (portfolio.mainState) {
        logger.error(`메인 포트폴리오 삭제 시도 - 포트폴리오 ID: ${portfolioId}`);
        throw new HttpExceptionResponse(400, '메인 포트폴리오는 삭제할 수 없습니다.');
      }

      const deletedPortfolioId: number = await this.portfolioRepository.deleteById(portfolio.id);

      return DefaultResponse.responseWithData(200, '포트폴리오 삭제 성공', {
        id: deletedPortfolioId,
      });
    } catch (error: any) {
      if (error instanceof HttpExceptionResponse) {
        logger.error(`포트폴리오 삭제 간 문제 발생 - 문제 내용: ${error.message}`);

        throw new HttpExceptionResponse(error.statusCode, error.message);
      } else {
        logger.error(`포트폴리오 삭제 간 문제 발생 - 문제 내용: ${error.message}`);

        throw new HttpExceptionResponse(500, '내부 서버 문제 발생');
      }
    }
  }

  /**
   * 포트폴리오 목록을 페이징하여 조회합니다.
   *
   * 이 메서드는 페이징 정보를 받아 포트폴리오 목록을 조회하며,
   * 전체 개수와 함께 페이징된 결과를 반환합니다.
   *
   * @param pageRequestDto 페이징 요청 DTO
   * @returns 페이징된 포트폴리오 목록과 메타데이터
   *
   * @throws Error 데이터베이스 조회 중 오류가 발생할 경우
   */
  async getPortfolioList(
    pageRequestDto: PageRequestDto
  ): Promise<DefaultResponse<Page<PortfolioListResponseDto>>> {
    try {
      const [portfolios, totalCount] = await this.portfolioRepository.findAllWithPaging(
        pageRequestDto.getOffset(),
        pageRequestDto.getLimit(),
        pageRequestDto.orderBy
      );

      const portfolioListResponseDtos = portfolios.map(
        (portfolio: Portfolio) => new PortfolioListResponseDto(portfolio)
      );

      const page = new Page<PortfolioListResponseDto>(
        pageRequestDto.pageNumber,
        pageRequestDto.perPageSize,
        totalCount,
        portfolioListResponseDtos
      );

      return DefaultResponse.responseWithData(200, '포트폴리오 목록 조회 성공', page);
    } catch (error: any) {
      logger.error(`포트폴리오 목록 조회 간 문제 발생 - 문제 내용: ${error.message}`);
      throw new HttpExceptionResponse(500, '포트폴리오 목록 조회 실패');
    }
  }

  /**
   * 포트폴리오 상세 조회 서비스입니다.
   *
   * @returns 포트폴리오 상세 정보를 담은 DefaultResponse 객체
   * @throws HttpExceptionResponse - 데이터베이스에서 포트폴리오 정보를 찾을 수 없는 경우
   * @param portfolioDetailRequestDto
   */
  async getDetailPortfolio(
    portfolioDetailRequestDto: PortfolioDetailRequestDto
  ): Promise<DefaultResponse<PortfolioDetailResponseDto>> {
    const portfolio: Portfolio = this.checkPortfolio(
      await this.portfolioRepository.findById(portfolioDetailRequestDto.portfolioId)
    );

    return DefaultResponse.responseWithData(
      200,
      '포트폴리오 상세 조회 성공',
      new PortfolioDetailResponseDto(portfolio)
    );
  }

  async getDetailMainPortfolio(): Promise<DefaultResponse<PortfolioDetailResponseDto>> {
    const mainPortfolios = await this.portfolioRepository.findByMainState(true);
    if (mainPortfolios.length === 0) {
      throw new HttpExceptionResponse(404, '메인 포트폴리오를 찾을 수 없습니다.');
    }

    const mainPortfolio = mainPortfolios[0];

    return DefaultResponse.responseWithData(
      200,
      '메인 포트폴리오 상세 조회 성공',
      new PortfolioDetailResponseDto(mainPortfolio)
    );
  }

  /**
   * 포트폴리오를 메인 포트폴리오로 설정합니다.
   * 기존의 메인 포트폴리오는 메인 여부가 false로 변경됩니다.
   *
   * @param portfolioSetMainRequestDto 포트폴리오 메인 설정 요청 DTO
   * @returns 업데이트된 포트폴리오 정보
   *
   * @throws Error 포트폴리오 업데이트 실패 시 예외 발생
   */
  async setPortfolioMain(
    portfolioSetMainRequestDto: PortfolioSetMainRequestDto
  ): Promise<DefaultResponse<PortfolioSetMainResponseDto>> {
    const oldMainPortfolios = await this.portfolioRepository.findByMainState(true);
    for (const oldMainPortfolio of oldMainPortfolios) {
      await this.portfolioRepository.update(
        oldMainPortfolio,
        portfolioSetMainRequestDto.toEntity(false)
      );
    }

    const mainPortfolio: Portfolio = await this.portfolioRepository.update(
      this.checkPortfolio(
        await this.portfolioRepository.findById(portfolioSetMainRequestDto.portfolioId)
      ),
      portfolioSetMainRequestDto.toEntity(true)
    );

    return DefaultResponse.responseWithData(
      200,
      '메인 포트폴리오로 설정 성공',
      new PortfolioSetMainResponseDto(mainPortfolio.id)
    );
  }

  /**
   * 조회한 포트폴리오가 null인 경우 예외를 발생시키고, 정상 데이터인 경우 그대로 반환합니다.
   *
   * @param portfolio - 조회된 포트폴리오 엔티티
   * @returns 유효성 검사 통과된 portfolio 객체
   * @throws HttpExceptionResponse - null일 경우 예외 발생
   */
  private checkPortfolio(portfolio: Portfolio | null): Portfolio {
    if (!portfolio) {
      throw new HttpExceptionResponse(404, '포트폴리오 조회 실패');
    }

    return portfolio;
  }
}
