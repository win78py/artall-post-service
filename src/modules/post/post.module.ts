import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/entities/post.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Follow } from 'src/entities/follow.entity';
import { UserInfo } from 'src/entities/userInfo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, UserInfo, Follow])],
  controllers: [PostController],
  providers: [PostService, CloudinaryService],
})
export class PostModule {}
