import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  postId: string;

  @IsNotEmpty()
  userId: string;
}
