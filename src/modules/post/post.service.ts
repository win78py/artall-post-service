import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOneOptions, Repository } from 'typeorm';
import { Order } from 'src/common/enum/enum';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Multer } from 'multer';
import { validate as uuidValidate } from 'uuid';
import { GetPostParams } from './dto/getList-post.dto';
import { Post } from '../../entities/post.entity';
import {
  CheckPostExistsRequest,
  CheckPostExistsResponse,
  CreatePostRequest,
  DeletePostResponse,
  GetPostIdRequest,
  PageMeta,
  PostResponse,
  PostsResponse,
  UpdatePostRequest,
} from 'src/common/interface/post.interface';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly entityManager: EntityManager,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getPosts(params: GetPostParams): Promise<PostsResponse> {
    const posts = this.postsRepository
      .createQueryBuilder('post')
      .select(['post'])
      .skip(params.skip)
      .take(params.take)
      .orderBy('post.createdAt', Order.DESC);
    if (params.search) {
      posts.andWhere('post.content ILIKE :post', {
        post: `%${params.search}%`,
      });
    }
    const [result, total] = await posts.getManyAndCount();
    const data: PostResponse[] = result.map((post) => ({
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

  async getPostById(request: GetPostIdRequest): Promise<PostResponse> {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .select(['post'])
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

    const post = await this.postsRepository
      .createQueryBuilder('post')
      .where('post.id = :id', { id })
      .getOne();

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    await this.postsRepository.softDelete(id);
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
