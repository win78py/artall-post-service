import { Repository } from 'typeorm';
import { Follow } from 'src/entities/follow.entity';
import { UserInfo } from 'src/entities/userInfo.entity';

export async function seedFollows(
  followRepository: Repository<Follow>,
  userInfoRepository: Repository<UserInfo>,
) {
  const user1 = await userInfoRepository.findOne({
    where: { username: 'thangtnsa' },
  });
  const user2 = await userInfoRepository.findOne({
    where: { username: 'hnhi' },
  });
  const user3 = await userInfoRepository.findOne({
    where: { username: 'locphuho' },
  });
  const user4 = await userInfoRepository.findOne({
    where: { username: 'vulong' },
  });
  const user5 = await userInfoRepository.findOne({
    where: { username: 'phuongnhu' },
  });

  const follow1 = followRepository.create({
    followerId: user1.id,
    followingId: user2.id,
    follower: user1,
    following: user2,
  });

  const follow2 = followRepository.create({
    followerId: user2.id,
    followingId: user3.id,
    follower: user2,
    following: user3,
  });

  const follow3 = followRepository.create({
    followerId: user3.id,
    followingId: user1.id,
    follower: user3,
    following: user1,
  });

  const follow4 = followRepository.create({
    followerId: user4.id,
    followingId: user5.id,
    follower: user4,
    following: user5,
  });

  const follow5 = followRepository.create({
    followerId: user5.id,
    followingId: user1.id,
    follower: user5,
    following: user1,
  });

  // Lưu các follow records vào cơ sở dữ liệu
  await followRepository.save([follow1, follow2, follow3, follow4, follow5]);
}
