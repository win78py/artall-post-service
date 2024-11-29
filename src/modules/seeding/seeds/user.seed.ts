// user.seed.ts
import { Repository } from 'typeorm';
import { GenderEnum, RoleEnum } from '../../../common/enum/enum';
import { UserInfo } from '../../../entities/userInfo.entity';
import { UserProfile } from '../../../entities/userProfile.entity';

export async function seedUsers(
  userInfoRepository: Repository<UserInfo>,
  userProfileRepository: Repository<UserProfile>,
) {
  const users = [];
  for (let i = 1; i <= 30; i++) {
    const username = `user${i}`;
    const userInfo = userInfoRepository.create({
      username,
      profilePicture:
        'https://res.cloudinary.com/dnjkwuc7p/image/upload/v1712043752/avatar/default_avatar.png',
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
