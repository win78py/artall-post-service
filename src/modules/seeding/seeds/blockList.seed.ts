import { Repository } from 'typeorm';
import { BlockList } from '../../../entities/blockList.entity';
import { UserInfo } from '../../../entities/userInfo.entity';

export async function seedBlockList(
  blockListRepository: Repository<BlockList>,
  userInfoRepository: Repository<UserInfo>,
) {
  // Fetch all users from the userInfoRepository
  const users = await userInfoRepository.find();
  if (users.length < 2) {
    throw new Error('Not enough users in the database to create block list.');
  }

  const blocks: BlockList[] = [];
  const totalBlocks = 3;

  // Create block entries
  for (let i = 0; i < totalBlocks; i++) {
    const blockerIndex = Math.floor(Math.random() * users.length);
    let blockedIndex = Math.floor(Math.random() * users.length);

    // Ensure the blocker and blocked users are different
    while (blockedIndex === blockerIndex) {
      blockedIndex = Math.floor(Math.random() * users.length);
    }

    const blocker = users[blockerIndex];
    const blocked = users[blockedIndex];

    const block = blockListRepository.create({
      blockerId: blocker.id,
      blockedId: blocked.id,
      blocker,
      blocked,
    });

    blocks.push(block);
  }

  await blockListRepository.save(blocks);
}
