import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOneOptions, In, Repository } from 'typeorm';
import { Order } from '../../common/enum/enum';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Multer } from 'multer';
import { validate as uuidValidate } from 'uuid';
import { Post } from '../../entities/post.entity';
import { Comment } from '../../entities/comment.entity';
import { Like } from '../../entities/like.entity';
import { LikeComment } from '../../entities/likeComment.entity';
import {
  CheckPostExistsRequest,
  CheckPostExistsResponse,
  CreatePostRequest,
  DeletePostResponse,
  GetPostIdRequest,
  PageMeta,
  PostInfoResponse,
  PostResponse,
  PostsResponse,
  UpdatePostRequest,
  GetAllPostsRequest,
  GetTotalPostsRequest,
  TotalPostsResponse,
} from '../../common/interface/post.interface';
import { RpcException } from '@nestjs/microservices';
import { Follow } from 'entities/follow.entity';
import { UserInfo } from 'entities/userInfo.entity';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly entityManager: EntityManager,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getPosts(params: GetAllPostsRequest): Promise<PostsResponse> {
    const userId = params.userId;

    const posts = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.userInfo', 'userInfo')
      .leftJoinAndSelect('post.likeList', 'like')
      .leftJoinAndSelect('post.comment', 'comment')
      .leftJoin(
        'like',
        'userLike',
        'userLike.postId = post.id AND userLike.userId = :userId',
        { userId },
      )
      .skip(params.skip)
      .take(params.take)
      .orderBy('post.createdAt', Order.DESC);

    if (params.content) {
      posts.andWhere('post.content ILIKE :post', {
        post: `%${params.content}%`,
      });
    }

    const [result, total] = await posts.getManyAndCount();

    const data: PostInfoResponse[] = result.map((post) => ({
      id: post.id,
      content: post.content,
      mediaPath: post.mediaPath,
      createdAt: post.createdAt ? post.createdAt.toISOString() : null,
      createdBy: post.createdBy || null,
      updatedAt: post.updatedAt ? post.updatedAt.toISOString() : null,
      updatedBy: post.updatedBy || null,
      deletedAt: post.deletedAt ? post.deletedAt.toISOString() : null,
      deletedBy: post.deletedBy || null,
      userId: post.userId,
      userInfo: {
        id: post.userInfo.id,
        username: post.userInfo.username,
        profilePicture: post.userInfo.profilePicture,
      },
      likeCount: post.likeList.length,
      commentCount: post.comment.length,
      isLiked: post.likeList.some((like) => like.userId === userId),
    }));

    const meta: PageMeta = {
      page: params.page,
      take: params.take,
      itemCount: total,
      pageCount: Math.ceil(total / params.take),
      hasPreviousPage: params.page > 1,
      hasNextPage: params.page < Math.ceil(total / params.take),
    };

    return { data, meta, message: 'Success' };
  }

  // async getPosts(params: GetAllPostsRequest): Promise<PostsResponse> {
  //   const posts = this.postsRepository
  //     .createQueryBuilder('post')
  //     .leftJoinAndSelect('post.userInfo', 'userInfo')
  //     .leftJoinAndSelect('post.likeList', 'like')
  //     .leftJoinAndSelect('post.comment', 'comment')
  //     .skip(params.skip)
  //     .take(params.take)
  //     .orderBy('post.createdAt', Order.DESC);
  //   if (params.content) {
  //     posts.andWhere('post.content ILIKE :post', {
  //       post: `%${params.content}%`,
  //     });
  //   }
  //   const [result, total] = await posts.getManyAndCount();
  //   const data: PostInfoResponse[] = result.map((post) => ({
  //     id: post.id,
  //     content: post.content,
  //     mediaPath: post.mediaPath,
  //     createdAt: post.createdAt ? post.createdAt.toISOString() : null,
  //     createdBy: post.createdBy || null,
  //     updatedAt: post.updatedAt ? post.updatedAt.toISOString() : null,
  //     updatedBy: post.updatedBy || null,
  //     deletedAt: post.deletedAt ? post.deletedAt.toISOString() : null,
  //     deletedBy: post.deletedBy || null,
  //     userId: post.userId,
  //     userInfo: {
  //       id: post.userInfo.id,
  //       username: post.userInfo.username,
  //       profilePicture: post.userInfo.profilePicture,
  //     },
  //     likeCount: post.likeList.length,
  //     commentCount: post.comment.length,
  //   }));

  //   const meta: PageMeta = {
  //     page: params.page,
  //     take: params.take,
  //     itemCount: total,
  //     pageCount: Math.ceil(total / params.take),
  //     hasPreviousPage: params.page > 1,
  //     hasNextPage: params.page < Math.ceil(total / params.take),
  //   };
  //   return { data, meta, message: 'Success' };
  // }

  private calculatePopularityScore(
    likeCount: number,
    commentCount: number,
  ): number {
    const totalInteractions = likeCount + commentCount;

    switch (true) {
      case totalInteractions >= 31:
        return 30;
      case totalInteractions >= 11:
        return 20;
      case totalInteractions >= 1:
        return 10;
      default:
        return 0;
    }
  }

  private currentUserId = 'a7dc1c9b-1cc7-4b48-a755-738b92feabd6';

  async calculateFollowScore(
    post: Post,
    currentUserId: string,
  ): Promise<number> {
    const follows = await this.followRepository.find({
      where: { followerId: currentUserId },
      select: ['followingId'],
    });

    const followedUserIds = follows.map((follow) => follow.followingId);

    if (followedUserIds.includes(post.userId)) {
      return 30;
    }

    return 0;
  }

  async calculateRecencyScore(post: Post): Promise<number> {
    const now = new Date();
    const createdAt = post.createdAt;
    const timeDiff = Math.abs(now.getTime() - createdAt.getTime());

    const secondsDiff = Math.floor(timeDiff / 1000);

    switch (true) {
      case secondsDiff < 3600:
        return 15;
      case secondsDiff < 43200:
        return 10;
      case secondsDiff < 604800:
        return 5;
      default:
        return 0;
    }
  }

  private generateRandomScore(): number {
    return Math.floor(Math.random() * 10) + 1;
  }

  async calculatePostScore(post: Post, currentUserId: string): Promise<number> {
    let totalScore = 0;

    totalScore += this.calculatePopularityScore(
      post.likeList.length,
      post.comment.length,
    );

    totalScore += await this.calculateFollowScore(post, currentUserId);

    totalScore += await this.calculateRecencyScore(post);

    // totalScore += this.generateRandomScore();

    return totalScore;
  }

  async getRandomPosts(params: GetAllPostsRequest): Promise<PostsResponse> {
    const postsQuery = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.userInfo', 'userInfo')
      .leftJoinAndSelect('post.likeList', 'like')
      .leftJoinAndSelect('post.comment', 'comment');

    if (params.content) {
      postsQuery.andWhere('post.content ILIKE :post', {
        post: `%${params.content}%`,
      });
    }

    const allPosts = await postsQuery.getMany();

    const postsWithScores = await Promise.all(
      allPosts.map(async (post) => {
        const score = await this.calculatePostScore(post, this.currentUserId);
        return { post, score };
      }),
    );

    postsWithScores.sort((a, b) => b.score - a.score);

    const total = postsWithScores.length; // Tổng số bài đăng
    const paginatedPosts = postsWithScores.slice(
      params.skip,
      params.skip + params.take,
    );

    const data: PostInfoResponse[] = paginatedPosts.map(({ post }) => ({
      id: post.id,
      content: post.content,
      mediaPath: post.mediaPath,
      createdAt: post.createdAt ? post.createdAt.toISOString() : null,
      createdBy: post.createdBy || null,
      updatedAt: post.updatedAt ? post.updatedAt.toISOString() : null,
      updatedBy: post.updatedBy || null,
      deletedAt: post.deletedAt ? post.deletedAt.toISOString() : null,
      deletedBy: post.deletedBy || null,
      userId: post.userId,
      userInfo: {
        id: post.userInfo.id,
        username: post.userInfo.username,
        profilePicture: post.userInfo.profilePicture,
      },
      likeCount: post.likeList.length,
      commentCount: post.comment.length,
      isLiked: false,
    }));

    const meta: PageMeta = {
      page: params.page,
      take: params.take,
      itemCount: total,
      pageCount: Math.ceil(total / params.take),
      hasPreviousPage: params.page > 1,
      hasNextPage: params.page < Math.ceil(total / params.take),
    };

    return { data, meta, message: 'Success' };
  }

  async getPostDeleted(params: GetAllPostsRequest): Promise<PostsResponse> {
    const userId = params.userId;

    const posts = this.postsRepository
      .createQueryBuilder('post')
      .withDeleted()
      .leftJoinAndSelect('post.userInfo', 'userInfo')
      .leftJoinAndSelect('post.likeList', 'like')
      .leftJoinAndSelect('post.comment', 'comment')
      .leftJoin(
        'like',
        'userLike',
        'userLike.postId = post.id AND userLike.userId = :userId',
        { userId },
      )
      .where('post.deletedAt IS NOT NULL')
      .skip(params.skip)
      .take(params.take)
      .orderBy('post.deletedAt', Order.DESC);

    if (params.content) {
      posts.andWhere('post.content ILIKE :post', {
        post: `%${params.content}%`,
      });
    }

    const [result, total] = await posts.getManyAndCount();

    const data: PostInfoResponse[] = result.map((post) => ({
      id: post.id,
      content: post.content,
      mediaPath: post.mediaPath,
      createdAt: post.createdAt ? post.createdAt.toISOString() : null,
      createdBy: post.createdBy || null,
      updatedAt: post.updatedAt ? post.updatedAt.toISOString() : null,
      updatedBy: post.updatedBy || null,
      deletedAt: post.deletedAt ? post.deletedAt.toISOString() : null,
      deletedBy: post.deletedBy || null,
      userId: post.userId,
      userInfo: {
        id: post.userInfo.id,
        username: post.userInfo.username,
        profilePicture: post.userInfo.profilePicture,
      },
      likeCount: post.likeList.length,
      commentCount: post.comment.length,
      isLiked: post.likeList.some((like) => like.userId === userId),
    }));

    const meta: PageMeta = {
      page: params.page,
      take: params.take,
      itemCount: total,
      pageCount: Math.ceil(total / params.take),
      hasPreviousPage: params.page > 1,
      hasNextPage: params.page < Math.ceil(total / params.take),
    };

    return { data, meta, message: 'Success' };
  }

  async getTotalPosts(
    params: GetTotalPostsRequest,
  ): Promise<TotalPostsResponse> {
    const period = params.period || 'year';
    const total = await this.postsRepository.count();
    const joinCounts: Record<number, number> = {};
    // Tính năm trước
    const pastYear = new Date();
    pastYear.setFullYear(pastYear.getFullYear() - 1);

    // Khai báo các biến để lưu trữ số lượng người dùng cũ và hiện tại
    let oldCount, currentCount;

    // Nếu khoảng thời gian là 'năm'
    if (period === 'year') {
      // Đếm số lượng người dùng trong năm trước và năm hiện tại
      oldCount = await this.postsRepository
        .createQueryBuilder('post')
        .where('EXTRACT(YEAR FROM post.createdAt) = :pastYear', {
          pastYear: pastYear.getFullYear(),
        })
        .getCount();

      currentCount = await this.postsRepository
        .createQueryBuilder('post')
        .where('EXTRACT(YEAR FROM post.createdAt) = :currentYear', {
          currentYear: new Date().getFullYear(),
        })
        .getCount();
    } else if (period === 'month') {
      const currentMonth = new Date().getMonth() + 1;
      const pastMonth = currentMonth - 1 === 0 ? 12 : currentMonth - 1;
      const currentYear = new Date().getFullYear();
      const pastYear = currentMonth - 1 === 0 ? currentYear - 1 : currentYear;

      oldCount = await this.postsRepository
        .createQueryBuilder('post')
        .where('EXTRACT(YEAR FROM post.createdAt) = :pastYear', {
          pastYear: pastYear,
        })
        .andWhere('EXTRACT(MONTH FROM post.createdAt) = :pastMonth', {
          pastMonth: pastMonth,
        })
        .getCount();

      currentCount = await this.postsRepository
        .createQueryBuilder('post')
        .where('EXTRACT(YEAR FROM post.createdAt) = :currentYear', {
          currentYear: currentYear,
        })
        .andWhere('EXTRACT(MONTH FROM post.createdAt) = :currentMonth', {
          currentMonth: currentMonth,
        })
        .getCount();
    } else if (period === 'count_join') {
      // Nếu khoảng thời gian là 'count_join'
      const currentYear = new Date().getFullYear();

      // Đếm số lượng contribution được tạo theo từng tháng trong năm hiện tại
      for (let month = 0; month < 12; month++) {
        const count = await this.postsRepository
          .createQueryBuilder('post')
          .where('EXTRACT(YEAR FROM post.createdAt) = :year', {
            year: currentYear,
          })
          .andWhere('EXTRACT(MONTH FROM post.createdAt) = :month', {
            month: month + 1,
          })
          .getCount();

        joinCounts[month + 1] = count;
      }
    }

    const percentagePostChange =
      oldCount === 0 ? 100 : ((currentCount - oldCount) / oldCount) * 100;

    return {
      total,
      oldCount,
      currentCount,
      percentagePostChange,
      joinCounts: joinCounts,
    };
  }

  async getPostById(request: GetPostIdRequest): Promise<PostInfoResponse> {
    const userId = request.userId;

    const post = await this.postsRepository
      .createQueryBuilder('post')
      .select(['post'])
      .leftJoinAndSelect('post.userInfo', 'userInfo')
      .leftJoinAndSelect('post.likeList', 'like')
      .leftJoinAndSelect('post.comment', 'comment')
      .leftJoin(
        'like',
        'userLike',
        'userLike.postId = post.id AND userLike.userId = :userId',
        { userId },
      )
      .where('post.id = :id', { id: request.id })
      .getOne();

    if (!post) {
      throw new NotFoundException(`Post with ID ${request.id} not found`);
    }

    return {
      id: post.id,
      content: post.content,
      mediaPath: post.mediaPath,
      createdAt: post.createdAt ? post.createdAt.toISOString() : null,
      createdBy: post.createdBy || '',
      updatedAt: post.updatedAt ? post.updatedAt.toISOString() : null,
      updatedBy: post.updatedBy || '',
      deletedAt: post.deletedAt ? post.deletedAt.toISOString() : null,
      deletedBy: post.deletedBy || '',
      userId: post.userId,
      userInfo: {
        id: post.userInfo.id,
        username: post.userInfo.username,
        profilePicture: post.userInfo.profilePicture,
      },
      likeCount: post.likeList.length,
      commentCount: post.comment.length,
      isLiked: post.likeList.some((like) => like.userId === userId),
    };
  }

  async create(createPostRequest: CreatePostRequest): Promise<PostResponse> {
    const { mediaPath, userId } = createPostRequest;
    try {
      const mediaUrls: string[] = [];
      if (mediaPath && mediaPath.length > 0) {
        this.logger.log('Uploading mediaPath to Cloudinary');
        for (const buffer of mediaPath) {
          const url = await this.uploadAndReturnUrl({
            buffer,
            mimetype: 'image/jpeg',
          });
          mediaUrls.push(url);
        }
      }

      const userInfo = await this.entityManager.findOne(UserInfo, {
        where: { id: userId },
      });
      if (!userInfo) {
        throw new RpcException('User not found');
      }

      const post = this.entityManager.create(Post, {
        ...createPostRequest,
        mediaPath: mediaUrls,
      });

      await this.entityManager.save(post);

      this.logger.log(`Post created successfully: id: ${post.id}`);

      return {
        id: post.id,
        content: post.content,
        mediaPath: post.mediaPath,
        createdAt: post.createdAt ? post.createdAt.toISOString() : null,
        createdBy: post.createdBy || '',
        updatedAt: post.updatedAt ? post.updatedAt.toISOString() : null,
        updatedBy: post.updatedBy || '',
        deletedAt: post.deletedAt ? post.deletedAt.toISOString() : null,
        deletedBy: post.deletedBy || '',
        userId: post.userId,
        userInfo: {
          id: userInfo.id,
          username: userInfo.username,
          profilePicture: userInfo.profilePicture,
        },
      };
    } catch (error) {
      this.logger.error(`Error in create: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new RpcException(error.message);
    }
  }

  async checkPostExists(
    data: CheckPostExistsRequest,
  ): Promise<CheckPostExistsResponse> {
    const post = await this.postsRepository.findOne({
      where: { id: data.id },
    });
    return { exists: !!post };
  }

  async update(updatePostRequest: UpdatePostRequest): Promise<PostResponse> {
    const { id, content, mediaPath } = updatePostRequest;

    try {
      const findOptions: FindOneOptions<Post> = { where: { id } };
      const post = await this.postsRepository.findOne(findOptions);

      let mediaUrls: string[] = post.mediaPath;

      if (mediaPath && mediaPath.length > 0) {
        await this.deleteOldMediaPath(post);
        mediaUrls = await Promise.all(
          mediaPath.map(async (buffer) => {
            if (!Buffer.isBuffer(buffer)) {
              this.logger.error(
                `Expected buffer to be a Buffer but got: ${typeof buffer}`,
              );
              throw new Error(
                '"buf" argument must be a string or an instance of Buffer',
              );
            }
            const url = await this.uploadAndReturnUrl({
              buffer,
              mimetype: 'image/jpeg',
            });
            return url;
          }),
        );
      }

      if (content !== undefined && content.trim() !== '') {
        post.content = content;
      }

      post.mediaPath = mediaUrls;

      await this.entityManager.save(post);

      return {
        id: post.id,
        content: post.content,
        mediaPath: post.mediaPath,
        createdAt: post.createdAt ? post.createdAt.toISOString() : null,
        createdBy: post.createdBy || '',
        updatedAt: post.updatedAt ? post.updatedAt.toISOString() : null,
        updatedBy: post.updatedBy || '',
        deletedAt: post.deletedAt ? post.deletedAt.toISOString() : null,
        deletedBy: post.deletedBy || '',
        userId: post.userId,
        userInfo: {
          id: post.userInfo.id,
          username: post.userInfo.username,
          profilePicture: post.userInfo.profilePicture,
        },
      };
    } catch (error) {
      this.logger.error(`Error in update: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new RpcException(error.message);
    }
  }

  async remove(id: string): Promise<DeletePostResponse> {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    await this.entityManager.transaction(async (transactionalEntityManager) => {
      const comments = await transactionalEntityManager.find(Comment, {
        where: { postId: id },
      });
      const commentIds = comments.map((comment) => comment.id);
      if (commentIds.length > 0) {
        await transactionalEntityManager.softDelete(LikeComment, {
          comment: { id: In(commentIds) },
        });
        await transactionalEntityManager.softDelete(Comment, {
          id: In(commentIds),
        });
      }
      await transactionalEntityManager.softDelete(Like, { postId: id });
      await transactionalEntityManager.softDelete(Post, id);
    });

    return { data: null, message: 'Post deletion successful' };
  }

  //CLOUDINARY
  async deleteOldMediaPath(post: Post): Promise<void> {
    if (post.mediaPath && post.mediaPath.length > 0) {
      await Promise.all(
        post.mediaPath.map(async (url) => {
          const publicId = this.cloudinaryService.extractPublicIdFromUrl(url);
          await this.cloudinaryService.deleteFile(publicId);
        }),
      );
    }
  }

  async uploadAndReturnUrl(file: Multer.File): Promise<string> {
    try {
      const result = await this.cloudinaryService.uploadImageFile(file);
      return result.secure_url;
    } catch (error) {
      this.logger.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  }
}
