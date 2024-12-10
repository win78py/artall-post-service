import { Repository } from 'typeorm';
import { Comment } from '../../../entities/comment.entity';
import { UserInfo } from '../../../entities/userInfo.entity';
import { Post } from '../../../entities/post.entity';

export async function seedComments(
  commentRepository: Repository<Comment>,
  userInfoRepository: Repository<UserInfo>,
  postRepository: Repository<Post>,
) {
  const users = await userInfoRepository.find();
  const posts = await postRepository.find();

  const commentContents = [
    'This design is really creative!',
    'I really like the use of colors in this article.',
    'The layout could be improved a bit.',
    'This is the idea I have been looking for!',
    'The design is very professional and detailed!',
    'The article is very interesting, thanks for sharing.',
    'I learned a lot from this article.',
    'Can you tell me what software you used to design?',
    'The arrangement of the sections is very logical!',
    'You are really talented in graphic design!',
  ];

  const comments: Comment[] = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];

    const numberOfComments = Math.floor(Math.random() * 3);

    for (let j = 0; j < numberOfComments; j++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomContent =
        commentContents[Math.floor(Math.random() * commentContents.length)];

      const comment = commentRepository.create({
        content: randomContent,
        mediaPath: [],
        postId: post.id,
        userId: randomUser.id,
        post: post,
        user: randomUser,
      });

      comments.push(comment);
    }
  }

  await commentRepository.save(comments);
}
