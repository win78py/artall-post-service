import { Repository } from 'typeorm';
import { Comment } from 'src/entities/comment.entity';
import { UserInfo } from 'src/entities/userInfo.entity';
import { Post } from 'src/entities/post.entity';

export async function seedComments(
  commentRepository: Repository<Comment>,
  userInfoRepository: Repository<UserInfo>,
  postRepository: Repository<Post>,
) {
  const users = await userInfoRepository.find();
  const posts = await postRepository.find();

  const commentContents = [
    'Thiết kế này thực sự rất sáng tạo!',
    'Tôi rất thích cách sử dụng màu sắc trong bài viết này.',
    'Có thể cải thiện thêm một chút về bố cục.',
    'Đây là ý tưởng mà tôi đã tìm kiếm bấy lâu!',
    'Thiết kế rất chuyên nghiệp và chi tiết!',
    'Bài viết rất thú vị, cảm ơn bạn đã chia sẻ.',
    'Tôi đã học được rất nhiều từ bài viết này.',
    'Bạn có thể cho tôi biết phần mềm nào bạn dùng để thiết kế không?',
    'Cách sắp xếp các phần rất logic!',
    'Bạn thật sự có tài năng trong việc thiết kế đồ họa!',
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
