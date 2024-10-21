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
  RandomPostsResponse,
  GetRandomPostsRequest,
  CursorPageMeta,
} from '../../common/interface/post.interface';
import { RpcException } from '@nestjs/microservices';
import { Follow } from 'entities/follow.entity';

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
    const posts = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.userInfo', 'userInfo')
      .leftJoinAndSelect('post.likeList', 'like')
      .leftJoinAndSelect('post.comment', 'comment')
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

    const getRandomScore = (maxScore: number): number => {
      return Math.floor(Math.random() * (maxScore + 1));
    };

    switch (true) {
      case secondsDiff < 3600:
        return getRandomScore(15);
      case secondsDiff < 43200:
        return getRandomScore(10);
      case secondsDiff < 604800:
        return getRandomScore(5);
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

    totalScore += this.generateRandomScore();

    return totalScore;
  }

  async getRandomPosts(
    params: GetRandomPostsRequest,
  ): Promise<RandomPostsResponse> {
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

    // Lấy tất cả bài đăng
    const allPosts = await postsQuery.getMany();

    // Tính toán điểm cho từng bài đăng
    const postsWithScores = await Promise.all(
      allPosts.map(async (post) => {
        const score = await this.calculatePostScore(post, this.currentUserId);
        return { post, score };
      }),
    );

    // Sắp xếp theo điểm giảm dần
    postsWithScores.sort((a, b) => b.score - a.score);

    const total = postsWithScores.length; // Tổng số bài đăng
    let startIndex = 0; // Chỉ số bắt đầu
    if (params.cursor) {
      // Tìm chỉ số của lastPostId trong danh sách đã sắp xếp
      const lastPostIndex = postsWithScores.findIndex(
        ({ post }) => post.id === params.cursor,
      );

      // Nếu tìm thấy lastPostId, bắt đầu từ chỉ số tiếp theo
      if (lastPostIndex !== -1) {
        startIndex = lastPostIndex + 1;
      }
    }

    // Lấy các bài đăng tiếp theo
    const paginatedPosts = postsWithScores.slice(
      startIndex,
      startIndex + params.take,
    );

    // Chuyển đổi sang định dạng dữ liệu cần trả về
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
    }));

    // Tạo meta cho pagination
    const meta: CursorPageMeta = {
      cursor: params.cursor || null, // Nếu cần, cập nhật logic cho cursor
      take: params.take,
      itemCount: total,
      hasPreviousPage: false, // Cần cập nhật nếu bạn muốn hỗ trợ trang trước
      hasNextPage: postsWithScores.length > params.take, // Kiểm tra có trang tiếp theo không
    };

    return { data, meta, message: 'Success' };
  }

  async getPostById(request: GetPostIdRequest): Promise<PostInfoResponse> {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .select(['post'])
      .leftJoinAndSelect('post.userInfo', 'userInfo')
      .leftJoinAndSelect('post.likeList', 'like')
      .leftJoinAndSelect('post.comment', 'comment')
      .where('post.id = :id', { id: request.id })
      .getOne();

    if (!post) {
      throw new NotFoundException(`User with ID ${request.id} not found`);
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
    };
  }

  async create(createPostRequest: CreatePostRequest): Promise<PostResponse> {
    const { mediaPath } = createPostRequest;
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
