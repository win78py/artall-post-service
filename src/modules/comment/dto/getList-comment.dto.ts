import { PageOptionsDto } from '../../../common/dtos/pageOption';

export class GetCommentParams extends PageOptionsDto {
  content: string;
  mediaPath: string;
  postId: string;
  userId: string;
}
