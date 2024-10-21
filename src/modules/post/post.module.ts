import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../entities/post.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Follow } from '../../entities/follow.entity';
import { UserInfo } from '../../entities/userInfo.entity';
import { Like } from 'entities/like.entity';
import { Comment } from 'entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, UserInfo, Follow, Like, Comment])],
  controllers: [PostController],
  providers: [PostService, CloudinaryService],
})
export class PostModule {}
