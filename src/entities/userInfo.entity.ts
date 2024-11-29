import { AbstractEntity } from '../common/entities/abstract.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Follow } from './follow.entity';
import { Post } from './post.entity';
import { Like } from './like.entity';
import { Comment } from './comment.entity';
import { UserProfile } from './userProfile.entity';
import { BlockList } from './blockList.entity';
import { LikeComment } from './likeComment.entity';

@Entity()
export class UserInfo extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  profilePicture: string =
    'https://res.cloudinary.com/dnjkwuc7p/image/upload/v1712043752/avatar/default_avatar.png';

  // User profile relationship
  @OneToOne(() => UserProfile, (userProfile) => userProfile.userInfo)
  userProfile: UserProfile;

  // Follow relationship
  @OneToMany(() => Follow, (follow) => follow.follower, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  follower: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  following: Follow[];

  // BlockList relationship
  @OneToMany(() => BlockList, (block) => block.blocker, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  blocker: BlockList[];

  @OneToMany(() => BlockList, (block) => block.blocked, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  blocked: BlockList[];

  @OneToMany(() => Post, (post) => post.userInfo, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  post: Post[];

  @OneToMany(() => Like, (like) => like.user, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  likeList: Like[];

  @OneToMany(() => LikeComment, (LikeComment) => LikeComment.user, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  likeCommentList: LikeComment[];

  @OneToMany(() => Comment, (comment) => comment.user, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  comment: Comment[];

  constructor(userInfo: Partial<UserInfo>) {
    super();
    Object.assign(this, userInfo);
  }
}
