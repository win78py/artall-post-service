import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './common/db/db.module';
import { PostModule } from './modules/post/post.module';
import { LikeModule } from './modules/like/like.module';
import { CommentModule } from './modules/comment/comment.module';
import { LikeCommentModule } from './modules/likeComment/likeComment.module';
import { SeedingModule } from './modules/seeding/seeding.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    SeedingModule,
    PostModule,
    LikeModule,
    CommentModule,
    LikeCommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
