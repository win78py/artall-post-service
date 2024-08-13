import { AbstractEntity } from '../common/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserInfo } from './userInfo.entity';
import { Post } from './post.entity';
import { LikeComment } from './likeComment.entity';

@Entity()
export class Comment extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column('jsonb', { nullable: true })
  mediaPath: string[];

  @Column({ nullable: true })
  postId: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => Post, (post) => post.comment)
  @JoinColumn({ name: 'postId', referencedColumnName: 'id' })
  post: Post;

  @ManyToOne(() => UserInfo, (user) => user.comment)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: UserInfo;

  @OneToMany(() => LikeComment, (like) => like.comment, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  likeCommentList: LikeComment[];

  constructor(comment: Partial<Comment>) {
    super();
    Object.assign(this, comment);
  }
}
