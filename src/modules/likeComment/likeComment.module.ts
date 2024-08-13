import { Module } from '@nestjs/common';
import { LikeCommentService } from './likeComment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeComment } from '../../entities/likeComment.entity';
import { Comment } from '../../entities/Comment.entity';
import { LikeCommentController } from './likeComment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LikeComment, Comment])],
  controllers: [LikeCommentController],
  providers: [LikeCommentService],
})
export class LikeCommentModule {}
