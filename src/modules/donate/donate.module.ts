import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonateController } from './donate.controller';
import { UserInfo } from '../../entities/userInfo.entity';
import { DonateService } from './donate.service';
import { Post } from '../../entities/post.entity';
import { Donation } from '../../entities/donation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Donation, UserInfo, Post])],
  controllers: [DonateController],
  providers: [DonateService],
})
export class DonateModule {}
