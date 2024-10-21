import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedUsers } from './seeds/user.seed';
import { seedFollows } from './seeds/follow.seed';
import { UserInfo } from '../../entities/userInfo.entity';
import { UserProfile } from '../../entities/userProfile.entity';
import { BlockList } from '../../entities/blockList.entity';
import { Follow } from '../../entities/follow.entity';
import { Post } from '../../entities/post.entity';
import { Comment } from '../../entities/comment.entity';
import { Like } from '../../entities/like.entity';
import { LikeComment } from '../../entities/likeComment.entity';
import { seedBlockList } from './seeds/blockList.seed';
import { seedComments } from './seeds/comment.seed';
import { seedPosts } from './seeds/post.seed';
import { seedLikes } from './seeds/like.seed';
import { seedCommentLikes } from './seeds/commentLike.seed';

@Injectable()
export class SeedingService {
  constructor(private readonly dataSource: DataSource) {}

  async seed() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Truy xuất các repository cho UserInfo và UserProfile
      const userInfoRepository = queryRunner.manager.getRepository(UserInfo);
      const userProfileRepository =
        queryRunner.manager.getRepository(UserProfile);
      const blockListRepository = queryRunner.manager.getRepository(BlockList);
      const followRepository = queryRunner.manager.getRepository(Follow);
      const postRepository = queryRunner.manager.getRepository(Post);
      const commentRepository = queryRunner.manager.getRepository(Comment);
      const likeRepository = queryRunner.manager.getRepository(Like);
      const commentLikeRepository =
        queryRunner.manager.getRepository(LikeComment);

      // Xóa dữ liệu hiện có
      const usersInfo = await userInfoRepository.find();
      const usersProfile = await userProfileRepository.find();
      const blockList = await blockListRepository.find();
      const follow = await followRepository.find();
      const post = await postRepository.find();
      const comment = await commentRepository.find();
      const like = await likeRepository.find();
      const commentLike = await commentLikeRepository.find();

      await commentLikeRepository.remove(commentLike);
      await likeRepository.remove(like);
      await commentRepository.remove(comment);
      await postRepository.remove(post);
      await blockListRepository.remove(blockList);
      await followRepository.remove(follow);
      await userProfileRepository.remove(usersProfile);
      await userInfoRepository.remove(usersInfo);

      // Seed dữ liệu
      await seedUsers(userInfoRepository, userProfileRepository);
      await seedFollows(followRepository, userInfoRepository);
      await seedBlockList(blockListRepository, userInfoRepository);
      await seedPosts(postRepository, userInfoRepository);
      await seedComments(commentRepository, userInfoRepository, postRepository);
      await seedLikes(likeRepository, userInfoRepository, postRepository);
      await seedCommentLikes(
        commentLikeRepository,
        userInfoRepository,
        commentRepository,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
