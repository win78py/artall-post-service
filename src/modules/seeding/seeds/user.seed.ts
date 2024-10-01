import { Repository } from 'typeorm';
import { GenderEnum, RoleEnum } from '../../../common/enum/enum';
import { UserInfo } from '../../../entities/userInfo.entity';
import { UserProfile } from '../../../entities/userProfile.entity';

export async function seedUsers(
  userInfoRepository: Repository<UserInfo>,
  userProfileRepository: Repository<UserProfile>,
) {
  const userInfo1 = userInfoRepository.create({
    username: 'thangtnsa',
    profilePicture:
      'https://res.cloudinary.com/dnjkwuc7p/image/upload/v1712043752/avatar/default_avatar.png',
  });
  await userInfoRepository.save(userInfo1);

  const userProfile1 = userProfileRepository.create({
    password: '123456789',
    email: 'thangtnsa000@example.com',
    fullName: 'Nguyen Huu Thang',
    phoneNumber: '123-456-7890',
    role: RoleEnum.USER,
    birthDate: new Date('1990-01-01'),
    gender: GenderEnum.MALE,
    location: '123 Elm Street, Springfield',
    lastLogin: new Date(),
    isActive: true,
    userInfo: userInfo1,
  });
  await userProfileRepository.save(userProfile1);

  // Tạo userInfo cho user2
  const userInfo2 = userInfoRepository.create({
    username: 'hnhi',
    profilePicture:
      'https://res.cloudinary.com/dnjkwuc7p/image/upload/v1712043752/avatar/default_avatar.png',
  });
  await userInfoRepository.save(userInfo2);

  const userProfile2 = userProfileRepository.create({
    password: '123456789',
    email: 'hnhi@example.com',
    fullName: 'Nguyen Thi Huyen Nhi',
    phoneNumber: '234-567-8901',
    role: RoleEnum.USER,
    birthDate: new Date('1992-05-15'),
    gender: GenderEnum.FEMALE,
    location: '456 Oak Avenue, Metropolis',
    lastLogin: new Date(),
    isActive: true,
    userInfo: userInfo2,
  });
  await userProfileRepository.save(userProfile2);

  const userInfo3 = userInfoRepository.create({
    username: 'locphuho',
    profilePicture:
      'https://res.cloudinary.com/dnjkwuc7p/image/upload/v1712043752/avatar/default_avatar.png',
  });
  await userInfoRepository.save(userInfo3);

  const userProfile3 = userProfileRepository.create({
    password: '123',
    email: 'locphuho@example.com',
    fullName: 'Huynh Ngoc Hoang Loc',
    phoneNumber: '345-678-9012',
    role: RoleEnum.USER,
    birthDate: new Date('1995-07-20'),
    gender: GenderEnum.MALE,
    location: '789 Pine Street, Gotham',
    lastLogin: new Date(),
    isActive: true,
    userInfo: userInfo3,
  });
  await userProfileRepository.save(userProfile3);

  const userInfo4 = userInfoRepository.create({
    username: 'vulong',
    profilePicture:
      'https://res.cloudinary.com/dnjkwuc7p/image/upload/v1712043752/avatar/default_avatar.png',
  });
  await userInfoRepository.save(userInfo4);

  const userProfile4 = userProfileRepository.create({
    password: 'password123',
    email: 'vulong@example.com',
    fullName: 'Vu Tien Long',
    phoneNumber: '456-789-0123',
    role: RoleEnum.USER,
    birthDate: new Date('1996-09-12'),
    gender: GenderEnum.MALE,
    location: '12 Hoang Dieu, Ha Noi',
    lastLogin: new Date(),
    isActive: true,
    userInfo: userInfo4,
  });
  await userProfileRepository.save(userProfile4);

  const userInfo5 = userInfoRepository.create({
    username: 'phuongnhu',
    profilePicture:
      'https://res.cloudinary.com/dnjkwuc7p/image/upload/v1712043752/avatar/default_avatar.png',
  });
  await userInfoRepository.save(userInfo5);

  const userProfile5 = userProfileRepository.create({
    password: 'securePass123',
    email: 'phuongnhu@example.com',
    fullName: 'Nguyen Phuong Nhu',
    phoneNumber: '567-890-1234',
    role: RoleEnum.USER,
    birthDate: new Date('1994-11-04'),
    gender: GenderEnum.FEMALE,
    location: '34 Tran Phu, Da Nang',
    lastLogin: new Date(),
    isActive: true,
    userInfo: userInfo5,
  });
  await userProfileRepository.save(userProfile5);

  const userInfo6 = userInfoRepository.create({
    username: 'linhvu',
    profilePicture:
      'https://res.cloudinary.com/dnjkwuc7p/image/upload/v1712043752/avatar/default_avatar.png',
  });
  await userInfoRepository.save(userInfo6);

  const userProfile6 = userProfileRepository.create({
    password: 'password2023',
    email: 'linhvu@example.com',
    fullName: 'Vu Minh Linh',
    phoneNumber: '678-901-2345',
    role: RoleEnum.USER,
    birthDate: new Date('2002-03-18'),
    gender: GenderEnum.FEMALE,
    location: '56 Le Loi, Ho Chi Minh City',
    lastLogin: new Date(),
    isActive: true,
    userInfo: userInfo6,
  });
  await userProfileRepository.save(userProfile6);

  const userInfo7 = userInfoRepository.create({
    username: 'ngocanh',
    profilePicture:
      'https://res.cloudinary.com/dnjkwuc7p/image/upload/v1712043752/avatar/default_avatar.png',
  });
  await userInfoRepository.save(userInfo7);

  const userProfile7 = userProfileRepository.create({
    password: 'anhpass321',
    email: 'ngocanh@example.com',
    fullName: 'Nguyen Ngoc Anh',
    phoneNumber: '789-012-3456',
    role: RoleEnum.USER,
    birthDate: new Date('2000-08-24'), // 24 tuổi
    gender: GenderEnum.FEMALE,
    location: '78 Nguyen Hue, Hue',
    lastLogin: new Date(),
    isActive: true,
    userInfo: userInfo7,
  });
  await userProfileRepository.save(userProfile7);

  const userInfo8 = userInfoRepository.create({
    username: 'tuannam',
    profilePicture:
      'https://res.cloudinary.com/dnjkwuc7p/image/upload/v1712043752/avatar/default_avatar.png',
  });
  await userInfoRepository.save(userInfo8);

  const userProfile8 = userProfileRepository.create({
    password: 'namtuan123',
    email: 'tuannam@example.com',
    fullName: 'Nguyen Tuan Nam',
    phoneNumber: '890-123-4567',
    role: RoleEnum.USER,
    birthDate: new Date('2003-06-05'),
    gender: GenderEnum.MALE,
    location: '90 Bach Dang, Hai Phong',
    lastLogin: new Date(),
    isActive: true,
    userInfo: userInfo8,
  });
  await userProfileRepository.save(userProfile8);

  const userInfo9 = userInfoRepository.create({
    username: 'hoangphuc',
    profilePicture:
      'https://res.cloudinary.com/dnjkwuc7p/image/upload/v1712043752/avatar/default_avatar.png',
  });
  await userInfoRepository.save(userInfo9);

  const userProfile9 = userProfileRepository.create({
    password: 'phucpass456',
    email: 'hoangphuc@example.com',
    fullName: 'Le Hoang Phuc',
    phoneNumber: '901-234-5678',
    role: RoleEnum.USER,
    birthDate: new Date('1999-02-10'),
    gender: GenderEnum.MALE,
    location: '23 Phan Chau Trinh, Quang Nam',
    lastLogin: new Date(),
    isActive: true,
    userInfo: userInfo9,
  });
  await userProfileRepository.save(userProfile9);

  const userInfo10 = userInfoRepository.create({
    username: 'kimngan',
    profilePicture:
      'https://res.cloudinary.com/dnjkwuc7p/image/upload/v1712043752/avatar/default_avatar.png',
  });
  await userInfoRepository.save(userInfo10);

  const userProfile10 = userProfileRepository.create({
    password: 'nganpass123',
    email: 'kimngan@example.com',
    fullName: 'Tran Kim Ngan',
    phoneNumber: '012-345-6789',
    role: RoleEnum.USER,
    birthDate: new Date('2005-12-12'),
    gender: GenderEnum.FEMALE,
    location: '12 Nguyen Van Linh, Can Tho',
    lastLogin: new Date(),
    isActive: true,
    userInfo: userInfo10,
  });
  await userProfileRepository.save(userProfile10);
}
