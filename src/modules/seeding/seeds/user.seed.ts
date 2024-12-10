import { Repository } from 'typeorm';
import { GenderEnum, RoleEnum } from '../../../common/enum/enum';
import { UserInfo } from '../../../entities/userInfo.entity';
import { UserProfile } from '../../../entities/userProfile.entity';

export async function seedUsers(
  userInfoRepository: Repository<UserInfo>,
  userProfileRepository: Repository<UserProfile>,
) {
  const avatarUrls = [
    'https://i.pinimg.com/736x/97/bb/06/97bb067e30ff6b89f4fbb7b9141025ca.jpg',
    'https://i.pinimg.com/736x/18/78/5d/18785dd07c09465d01beef679baf1846.jpg',
    'https://i.pinimg.com/736x/87/e2/eb/87e2eb4b34c6b71155f004994d40acba.jpg',
    'https://i.pinimg.com/736x/15/1c/a3/151ca3265e5ca4072c165eef9dd00888.jpg',
    'https://i.pinimg.com/736x/f3/3a/3d/f33a3d54caf67aaed7b95678ec58e51b.jpg',
    'https://i.pinimg.com/736x/d9/63/a1/d963a1cc040409d1ee79998f2506141b.jpg',
    'https://i.pinimg.com/736x/a9/be/08/a9be08b574727709be0411a60267cbab.jpg',
    'https://i.pinimg.com/736x/e5/1e/63/e51e631179145e820712eb54de679b1f.jpg',
    'https://i.pinimg.com/736x/5f/4a/a0/5f4aa0e1047ea8b941971549d3eadd2b.jpg',
    'https://i.pinimg.com/736x/21/30/a9/2130a9f62ae9c90a54613122b74b6795.jpg',
    'https://i.pinimg.com/736x/47/7b/f7/477bf778d2797885acadcc78e66158d0.jpg',
  ];

  const users = [];
  for (let i = 1; i <= 30; i++) {
    const username = `user${i}`;
    const randomAvatar =
      avatarUrls[Math.floor(Math.random() * avatarUrls.length)];

    const userInfo = userInfoRepository.create({
      username,
      profilePicture: randomAvatar,
    });
    await userInfoRepository.save(userInfo);

    const userProfile = userProfileRepository.create({
      password: '12345',
      email: `${username}@example.com`,
      fullName: `User ${i}`,
      phoneNumber: `000-000-000${i}`,
      role: RoleEnum.USER,
      birthDate: new Date(`199${Math.floor(i / 3)}-01-01`),
      gender: i % 2 === 0 ? GenderEnum.MALE : GenderEnum.FEMALE,
      location: `Location ${i}`,
      lastLogin: new Date(),
      isActive: true,
      userInfo: userInfo,
    });
    await userProfileRepository.save(userProfile);

    users.push(userInfo);
  }
}
