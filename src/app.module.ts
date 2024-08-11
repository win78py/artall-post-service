import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './common/db/db.module';
import { PostModule } from './modules/post/post.module';
import { LikeModule } from './modules/like/like.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    PostModule,
    LikeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
