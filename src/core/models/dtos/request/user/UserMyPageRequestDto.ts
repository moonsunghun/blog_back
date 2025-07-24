/**
 * @swagger
 * components:
 *   schemas:
 *     UserMyPageRequestDto:
 *       type: object
 *       description: 마이페이지 정보 조회 요청 (현재는 요청 파라미터 없음)
 *       properties: {}
 */

/**
 * 마이페이지 정보 조회 요청 DTO
 *
 * 현재는 세션에서 사용자 정보를 가져오므로 별도의 요청 파라미터가 필요하지 않습니다.
 * 추후 필터링이나 추가 옵션이 필요할 경우 이 클래스에 필드를 추가할 수 있습니다.
 */
export class UserMyPageRequestDto {
  constructor(data?: Partial<UserMyPageRequestDto>) {
    // 현재는 특별한 초기화 로직이 필요하지 않음
    if (data) {
      // 추후 필드 추가 시 여기서 초기화
    }
  }
}
