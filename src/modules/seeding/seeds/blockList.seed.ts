import { Repository } from 'typeorm';
import { BlockList } from 'src/entities/blocklist.entity';
import { UserInfo } from 'src/entities/userInfo.entity';

export async function seedBlockList(
  blockListRepository: Repository<BlockList>,
  userInfoRepository: Repository<UserInfo>,
) {
  const user1 = await userInfoRepository.findOne({
    where: { username: 'thangtnsa' },
  });
  const user5 = await userInfoRepository.findOne({
    where: { username: 'phuongnhu' },
  });
  const user6 = await userInfoRepository.findOne({
    where: { username: 'linhvu' },
  });

  const block1 = blockListRepository.create({
    blockerId: user5.id,
    blockedId: user6.id,
    blocker: user5,
    blocked: user6,
  });

  const block2 = blockListRepository.create({
    blockerId: user6.id,
    blockedId: user1.id,
    blocker: user6,
    blocked: user1,
  });

  await blockListRepository.save([block1, block2]);
}
