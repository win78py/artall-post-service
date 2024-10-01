import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  GenderEnum,
  RoleEnum,
  profileVisibilityEnum,
} from '../common/enum/enum';
import { AbstractEntity } from '../common/entities/abstract.entity';
import { UserInfo } from './userInfo.entity';

@Entity()
export class UserProfile extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  bio: string;

  @Column({
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.USER,
  })
  role: RoleEnum;

  @Column('timestamp')
  birthDate: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  socialLinks: string;

  @Column('timestamp', { nullable: true })
  lastLogin: Date;

  @Column({
    type: 'enum',
    enum: profileVisibilityEnum,
    default: profileVisibilityEnum.PUBLIC,
  })
  profileVisibility: profileVisibilityEnum;

  @Column({
    type: 'enum',
    enum: GenderEnum,
    default: GenderEnum.NULL,
  })
  gender: GenderEnum;

  @Column('boolean')
  isActive: boolean;

  @Column({ nullable: true })
  userInfoId: string;

  @OneToOne(() => UserInfo, (userInfo) => userInfo.userProfile)
  @JoinColumn({ name: 'userInfoId' })
  userInfo: UserInfo;

  constructor(userProfile: Partial<UserProfile>) {
    super();
    Object.assign(this, userProfile);
  }
}
