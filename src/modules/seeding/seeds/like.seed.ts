import { Repository } from 'typeorm';
import { Like } from '../../../entities/like.entity';
import { Post } from '../../../entities/post.entity';
import { UserInfo } from '../../../entities/userInfo.entity';

export async function seedLikes(
  likeRepository: Repository<Like>,
  postRepository: Repository<Post>,
  userInfoRepository: Repository<UserInfo>,
) {
  const posts = await postRepository.find();
  const users = await userInfoRepository.find();

  if (posts.length === 0 || users.length === 0) {
    throw new Error('No posts or users found to create likes.');
  }

  for (const post of posts) {
    // Randomly select a number of likes for each post (0 to 10)
    const numberOfLikes = Math.floor(Math.random() * 11);
    const shuffledUsers = users.sort(() => 0.5 - Math.random());

    for (let i = 0; i < numberOfLikes; i++) {
      const like = likeRepository.create({
        postId: post.id,
        userId: shuffledUsers[i].id,
        post: post,
        user: shuffledUsers[i],
      });
      await likeRepository.save(like);
    }
  }
}
