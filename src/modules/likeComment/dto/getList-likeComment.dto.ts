import { PageOptionsDto } from '../../../common/dtos/pageOption';

export class GetLikeCommentParams extends PageOptionsDto {
  commentId: string;
  userId: string;
}
