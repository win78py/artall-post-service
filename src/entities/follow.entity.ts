import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { UserInfo } from '../entities/userInfo.entity';
import { AbstractEntity } from 'src/common/entities';

@Entity('follow')
export class Follow extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  followerId: string;

  @Column()
  followingId: string;

  @ManyToOne(() => UserInfo, (user) => user.follower)
  @JoinColumn({ name: 'followerId', referencedColumnName: 'id' })
  follower: UserInfo;

  @ManyToOne(() => UserInfo, (user) => user.following)
  @JoinColumn({ name: 'followingId', referencedColumnName: 'id' })
  following: UserInfo;

  constructor(follow: Partial<Follow>) {
    super();
    Object.assign(this, follow);
  }
}
