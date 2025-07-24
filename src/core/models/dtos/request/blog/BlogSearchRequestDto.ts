import { PageRequestDto } from '../PageRequestDto';

/**
 * 블로그 목록 검색 및 페이징 요청 DTO
 */
export class BlogSearchRequestDto extends PageRequestDto {
  title?: string;

  constructor(data?: Partial<BlogSearchRequestDto>) {
    super(data);

    if (data) {
      if (data.pageNumber !== undefined) {
        this.pageNumber = data.pageNumber;
      }
      if (data.perPageSize !== undefined) {
        this.perPageSize = data.perPageSize;
      }
      if (data.title !== undefined) {
        this.title = data.title;
      }
      if (data.orderBy !== undefined) {
        this.orderBy = data.orderBy;
      }
    }
  }
}
