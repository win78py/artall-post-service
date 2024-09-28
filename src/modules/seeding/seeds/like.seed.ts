import { Repository } from 'typeorm';
import { Like } from 'src/entities/like.entity';
import { Post } from 'src/entities/post.entity';
import { UserInfo } from 'src/entities/userInfo.entity';

export async function seedLikes(
  likeRepository: Repository<Like>,
  postRepository: Repository<Post>,
  userInfoRepository: Repository<UserInfo>,
) {
  const posts = await postRepository.find();
  const users = await userInfoRepository.find();

  if (posts.length === 0 || users.length === 0) {
    throw new Error('No posts or users found');
  }

  const likes = [];

  for (const post of posts) {
    const numberOfLikes = Math.floor(Math.random() * 5) + 1;
    const shuffledUsers = users.sort(() => 0.5 - Math.random());

    for (let i = 0; i < numberOfLikes; i++) {
      const like = likeRepository.create({
        postId: post.id,
        userId: shuffledUsers[i].id,
        post: post,
        user: shuffledUsers[i],
      });
      likes.push(like);
    }
  }

  await likeRepository.save(likes);
}
