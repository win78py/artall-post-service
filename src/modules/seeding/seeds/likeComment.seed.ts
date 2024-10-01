import { Repository } from 'typeorm';
import { LikeComment } from '../../../entities/likeComment.entity';
import { Comment } from '../../../entities/comment.entity';
import { UserInfo } from '../../../entities/userInfo.entity';

export async function seedLikeComments(
  likeCommentRepository: Repository<LikeComment>,
  commentRepository: Repository<Comment>,
  userInfoRepository: Repository<UserInfo>,
) {
  const comments = await commentRepository.find();
  const users = await userInfoRepository.find();

  if (comments.length === 0 || users.length === 0) {
    throw new Error('No comments or users found');
  }

  const likeComments = [];

  for (const comment of comments) {
    const numberOfLikes = Math.floor(Math.random() * 3) + 1;
    const shuffledUsers = users.sort(() => 0.5 - Math.random());

    for (let i = 0; i < numberOfLikes; i++) {
      const likeComment = likeCommentRepository.create({
        commentId: comment.id,
        userId: shuffledUsers[i].id,
        comment: comment,
        user: shuffledUsers[i],
      });
      likeComments.push(likeComment);
    }
  }

  await likeCommentRepository.save(likeComments);
}
