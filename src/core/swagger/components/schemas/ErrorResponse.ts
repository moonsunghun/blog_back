/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           example: 400
 *         message:
 *           type: string
 *           example: "요청 파라미터 유효성 검사 실패"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "field"
 *               path:
 *                 type: string
 *                 example: "title"
 *               msg:
 *                 type: string
 *                 example: "제목은 필수입니다."
 *               location:
 *                 type: string
 *                 example: "body"
 *               value:
 *                 type: string
 *                 example: "123"
 */
