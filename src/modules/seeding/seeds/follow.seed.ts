// follow.seed.ts
import { Repository } from 'typeorm';
import { Follow } from '../../../entities/follow.entity';
import { UserInfo } from '../../../entities/userInfo.entity';

export async function seedFollows(
  followRepository: Repository<Follow>,
  userInfoRepository: Repository<UserInfo>,
) {
  const users = await userInfoRepository.find();

  if (users.length < 30) {
    throw new Error('Not enough users found to create followers.');
  }

  for (const user of users) {
    const shuffledUsers = users
      .filter((u) => u.id !== user.id) // Exclude the user from their own follow list
      .sort(() => Math.random() - 0.5); // Shuffle users

    // Select first 10 unique users to follow and to be followed by
    const followingUsers = shuffledUsers.slice(0, 10);
    const followerUsers = shuffledUsers.slice(10, 20);

    // Create follows for following users
    for (const followingUser of followingUsers) {
      const follow = followRepository.create({
        followerId: user.id,
        followingId: followingUser.id,
        follower: user,
        following: followingUser,
      });
      await followRepository.save(follow);
    }

    // Create follows for followers
    for (const followerUser of followerUsers) {
      const follow = followRepository.create({
        followerId: followerUser.id,
        followingId: user.id,
        follower: followerUser,
        following: user,
      });
      await followRepository.save(follow);
    }
  }
}
