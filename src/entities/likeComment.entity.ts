import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { UserInfo } from './userInfo.entity';
import { AbstractEntity } from '../common/entities/abstract.entity';
import { Comment } from './comment.entity';

@Entity()
export class LikeComment extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  commentId: string;

  @Column()
  userId: string;

  @ManyToOne(() => Comment, (comment) => comment.likeCommentList)
  @JoinColumn({ name: 'commentId', referencedColumnName: 'id' })
  comment: Comment;

  @ManyToOne(() => UserInfo, (user) => user.likeList)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: UserInfo;

  constructor(likComment: Partial<LikeComment>) {
    super();
    Object.assign(this, likComment);
  }
}
