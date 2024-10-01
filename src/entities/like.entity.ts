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
export class Like extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  postId: string;

  @Column()
  userId: string;

  @ManyToOne(() => Post, (post) => post.likeList)
  @JoinColumn({ name: 'postId', referencedColumnName: 'id' })
  post: Post;

  @ManyToOne(() => UserInfo, (user) => user.likeList)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: UserInfo;

  constructor(like: Partial<Like>) {
    super();
    Object.assign(this, like);
  }
}
