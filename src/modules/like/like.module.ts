import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from 'src/entities/like.entity';
import { UserInfo } from 'src/entities/userInfo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, UserInfo])],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
