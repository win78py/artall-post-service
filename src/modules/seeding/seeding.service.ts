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
import { seedBlockList } from './seeds/blockList.seed';
import { seedComments } from './seeds/comment.seed';
import { seedPosts } from './seeds/post.seed';

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

      // Xóa dữ liệu hiện có
      const usersInfo = await userInfoRepository.find();
      const usersProfile = await userProfileRepository.find();
      const blockList = await blockListRepository.find();
      const follow = await followRepository.find();
      const post = await postRepository.find();
      const comment = await commentRepository.find();

      await commentRepository.remove(comment);
      await postRepository.remove(post);
      await blockListRepository.remove(blockList);
      await followRepository.remove(follow);
      await userProfileRepository.remove(usersProfile); // Xóa userProfile trước để tránh ràng buộc liên kết
      await userInfoRepository.remove(usersInfo);

      // Seed dữ liệu
      await seedUsers(userInfoRepository, userProfileRepository);
      await seedFollows(followRepository, userInfoRepository);
      await seedBlockList(blockListRepository, userInfoRepository);
      await seedPosts(postRepository, userInfoRepository);
      await seedComments(commentRepository, userInfoRepository, postRepository);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
