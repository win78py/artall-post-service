import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import { UserInfo } from '../../entities/userInfo.entity';
import { UserProfile } from '../../entities/userProfile.entity';
import { Follow } from '../../entities/follow.entity';
import { BlockList } from '../../entities/blockList.entity';
import { Like } from '../../entities/like.entity';
import { Post } from '../../entities/post.entity';
import { Comment } from '../../entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserInfo,
      UserProfile,
      Follow,
      BlockList,
      Post,
      Like,
      Comment,
    ]),
  ],
  controllers: [SeedingController],
  providers: [SeedingService],
})
export class SeedingModule {}
