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
import { Like } from './like.entity';
import { Comment } from './comment.entity';
import { Donation } from './donation.entity';

@Entity()
export class Post extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column('jsonb', { nullable: true })
  mediaPath: string[];

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => UserInfo, (user) => user.post)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  userInfo: UserInfo;

  @OneToMany(() => Like, (like) => like.post, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  likeList: Like[];

  @OneToMany(() => Comment, (comment) => comment.post, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  comment: Comment[];

  @OneToMany(() => Donation, (donation) => donation.post, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  donation: Donation[];

  constructor(post: Partial<Post>) {
    super();
    Object.assign(this, post);
  }
}
