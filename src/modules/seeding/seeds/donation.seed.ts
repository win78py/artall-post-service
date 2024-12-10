import { Repository } from 'typeorm';
import { Donation } from '../../../entities/donation.entity';
import { Post } from '../../../entities/post.entity';
import { UserInfo } from '../../../entities/userInfo.entity';

export async function seedDonations(
  donationRepository: Repository<Donation>,
  postRepository: Repository<Post>,
  userInfoRepository: Repository<UserInfo>,
) {
  const posts = await postRepository.find();
  const users = await userInfoRepository.find();

  if (posts.length === 0 || users.length === 0) {
    throw new Error('No posts or users found to create donations.');
  }

  for (const post of posts) {
    // Randomly select the total donation amount for this post (0 to 300,000)
    let remainingAmount = Math.floor(Math.random() * 300001);
    const numberOfDonations = Math.floor(Math.random() * 4); // 0 to 3 donations
    const shuffledUsers = users.sort(() => 0.5 - Math.random());

    for (let i = 0; i < numberOfDonations && remainingAmount > 0; i++) {
      // Random donation amount between 10,000 and 100,000
      const donationAmount = Math.min(
        remainingAmount,
        Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000,
      );
      remainingAmount -= donationAmount;

      const donation = donationRepository.create({
        postId: post.id,
        userId: shuffledUsers[i].id,
        amount: donationAmount,
        app_trans_id: '',
        post: post,
        user: shuffledUsers[i],
      });

      await donationRepository.save(donation);
    }
  }
}
