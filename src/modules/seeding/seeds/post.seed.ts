import { Repository } from 'typeorm';
import { Post } from 'src/entities/post.entity';
import { UserInfo } from 'src/entities/userInfo.entity';

export async function seedPosts(
  postRepository: Repository<Post>,
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

  const captions = [
    'Thiết kế không chỉ là công việc, mà còn là đam mê của tôi.',
    'Hôm nay tôi thử nghiệm một phong cách hoàn toàn mới. Các bạn thấy sao?',
    'Lấy cảm hứng từ thiên nhiên, tôi đã tạo ra tác phẩm này.',
    'Màu sắc là ngôn ngữ của cảm xúc.',
    'Một chút sáng tạo vào buổi tối và đây là kết quả!',
    'Luôn có điều mới để học hỏi trong thế giới thiết kế đồ họa.',
    'Mọi chi tiết đều có ý nghĩa, bạn chỉ cần tìm ra nó.',
    'Đừng bao giờ sợ thử nghiệm với những ý tưởng táo bạo!',
    'Cảm hứng sáng tạo đến từ những điều nhỏ nhặt nhất trong cuộc sống.',
    'Thiết kế này là sự kết hợp giữa cổ điển và hiện đại.',
  ];

  const mediaLinks = [
    'https://i.pinimg.com/originals/cc/4e/32/cc4e3285fd109c54e6feb89ff02cc1ce.jpg',
    'https://i.pinimg.com/originals/7d/f1/ab/7df1abe62d38a8761694e12399273ce1.jpg',
    'https://i.pinimg.com/564x/d8/03/e9/d803e966bbfc62918f9835f6c4497dff.jpg',
    'https://i.pinimg.com/originals/62/94/01/62940118bcd4a95c61135b93d19de8da.jpg',
    'https://i.pinimg.com/736x/e4/2a/60/e42a60f4381a27746146973568024cfc.jpg',
    'https://i.pinimg.com/736x/d1/54/2a/d1542ab338cb62aa8c06f4cb6f8eb851.jpg',
    'https://i.pinimg.com/564x/11/8d/b6/118db6e5593f66166662b8a51f9f55c0.jpg',
    'https://i.pinimg.com/736x/ce/a0/ce/cea0cedd946cd71baf0234adb52a7af2.jpg',
    'https://i.pinimg.com/564x/cd/a0/91/cda091a15bd45be776f9f31083f903c1.jpg',
    'https://i.pinimg.com/originals/6e/20/c1/6e20c1fa43aa9c6a7d85b405ca681b5b.jpg',
  ];

  const posts: Post[] = [];

  const totalPosts = 30;
  const minPostsPerUser = 9;

  for (let i = 0; i < minPostsPerUser; i++) {
    const randomCaption = captions[Math.floor(Math.random() * captions.length)];
    const randomMediaLinks = mediaLinks
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 5) + 1);

    const post1 = postRepository.create({
      content: randomCaption,
      mediaPath: randomMediaLinks,
      userId: user1.id,
      userInfo: user1,
    });

    const post2 = postRepository.create({
      content: randomCaption,
      mediaPath: randomMediaLinks,
      userId: user2.id,
      userInfo: user2,
    });

    posts.push(post1, post2);
  }

  for (let i = posts.length; i < totalPosts; i++) {
    const randomCaption = captions[Math.floor(Math.random() * captions.length)];
    const randomMediaLinks = mediaLinks
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 5) + 1);
    const randomUser = [user1, user2, user3][Math.floor(Math.random() * 3)];

    const post = postRepository.create({
      content: randomCaption,
      mediaPath: randomMediaLinks,
      userId: randomUser.id,
      userInfo: randomUser,
    });

    posts.push(post);
  }

  await postRepository.save(posts);
}
