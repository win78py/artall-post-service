import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { UserInfo } from './userInfo.entity';
import { AbstractEntity } from '../common/entities/abstract.entity';
import { Post } from './post.entity';

@Entity()
export class Donation extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  postId: string;

  @Column()
  userId: string;

  @Column()
  amount: number;

  @Column()
  app_trans_id: string;

  @ManyToOne(() => Post, (post) => post.donation)
  @JoinColumn({ name: 'postId', referencedColumnName: 'id' })
  post: Post;

  @ManyToOne(() => UserInfo, (user) => user.donation)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: UserInfo;

  constructor(donation: Partial<Donation>) {
    super();
    Object.assign(this, donation);
  }
}
