import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOneOptions, Repository } from 'typeorm';
import { Order } from '../../common/enum/enum';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Multer } from 'multer';
import { validate as uuidValidate } from 'uuid';
import { GetCommentParams } from './dto/getList-comment.dto';
import { Comment } from '../../entities/comment.entity';
import {
  CheckCommentExistsRequest,
  CheckCommentExistsResponse,
  CreateCommentRequest,
  DeleteCommentResponse,
  GetCommentIdRequest,
  PageMeta,
  CommentResponse,
  CommentsResponse,
  UpdateCommentRequest,
  CommentInfoResponse,
} from '../../common/interface/comment.interface';
import { RpcException } from '@nestjs/microservices';
import { LikeComment } from '../../entities/likeComment.entity';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly entityManager: EntityManager,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getComments(params: GetCommentParams): Promise<CommentsResponse> {
    const comments = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .skip(params.skip)
      .take(params.take)
      .orderBy('comment.createdAt', Order.DESC);
    if (params.content) {
      comments.andWhere('comment.content ILIKE :content', {
        content: `%${params.content}%`,
      });
    }
    const [result, total] = await comments.getManyAndCount();
    const data: CommentInfoResponse[] = result.map((comment) => ({
      id: comment.id,
      content: comment.content,
      mediaPath: comment.mediaPath,
      createdAt: comment.createdAt ? comment.createdAt.toISOString() : null,
      createdBy: comment.createdBy || null,
      updatedAt: comment.updatedAt ? comment.updatedAt.toISOString() : null,
      updatedBy: comment.updatedBy || null,
      deletedAt: comment.deletedAt ? comment.deletedAt.toISOString() : null,
      deletedBy: comment.deletedBy || null,
      postId: comment.postId,
      userId: comment.userId,
      user: {
        id: comment.user.id,
        username: comment.user.username,
        profilePicture: comment.user.profilePicture,
      },
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

  async getCommentById(request: GetCommentIdRequest): Promise<CommentResponse> {
    const comment = await this.commentsRepository
      .createQueryBuilder('comment')
      .select(['comment'])
      .where('comment.id = :id', { id: request.id })
      .getOne();

    if (!comment) {
      throw new NotFoundException(`User with ID ${request.id} not found`);
    }

    return {
      id: comment.id,
      content: comment.content,
      mediaPath: comment.mediaPath,
      createdAt: comment.createdAt ? comment.createdAt.toISOString() : null,
      createdBy: comment.createdBy || '',
      updatedAt: comment.updatedAt ? comment.updatedAt.toISOString() : null,
      updatedBy: comment.updatedBy || '',
      deletedAt: comment.deletedAt ? comment.deletedAt.toISOString() : null,
      deletedBy: comment.deletedBy || '',
      postId: comment.postId,
      userId: comment.userId,
    };
  }

  async create(
    createCommentRequest: CreateCommentRequest,
  ): Promise<CommentResponse> {
    const { mediaPath } = createCommentRequest;
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

      const comment = this.entityManager.create(Comment, {
        ...createCommentRequest,
        mediaPath: mediaUrls,
      });

      await this.entityManager.save(comment);

      this.logger.log(`Comment created successfully: id: ${comment.id}`);

      return {
        id: comment.id,
        content: comment.content,
        mediaPath: comment.mediaPath,
        createdAt: comment.createdAt ? comment.createdAt.toISOString() : null,
        createdBy: comment.createdBy || '',
        updatedAt: comment.updatedAt ? comment.updatedAt.toISOString() : null,
        updatedBy: comment.updatedBy || '',
        deletedAt: comment.deletedAt ? comment.deletedAt.toISOString() : null,
        deletedBy: comment.deletedBy || '',
        postId: comment.postId,
        userId: comment.userId,
      };
    } catch (error) {
      this.logger.error(`Error in create: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new RpcException(error.message);
    }
  }

  async checkCommentExists(
    data: CheckCommentExistsRequest,
  ): Promise<CheckCommentExistsResponse> {
    const comment = await this.commentsRepository.findOne({
      where: { id: data.id },
    });
    return { exists: !!comment };
  }

  async update(
    updateCommentRequest: UpdateCommentRequest,
  ): Promise<CommentResponse> {
    const { id, content, mediaPath } = updateCommentRequest;

    try {
      const findOptions: FindOneOptions<Comment> = { where: { id } };
      const comment = await this.commentsRepository.findOne(findOptions);

      let mediaUrls: string[] = comment.mediaPath;

      if (mediaPath && mediaPath.length > 0) {
        await this.deleteOldMediaPath(comment);
        mediaUrls = await Promise.all(
          mediaPath.map(async (buffer) => {
            if (!Buffer.isBuffer(buffer)) {
              this.logger.error(
                'Expected buffer to be a Buffer but got: ${typeof buffer}',
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
        comment.content = content;
      }

      comment.mediaPath = mediaUrls;

      await this.entityManager.save(comment);

      return {
        id: comment.id,
        content: comment.content,
        mediaPath: comment.mediaPath,
        createdAt: comment.createdAt ? comment.createdAt.toISOString() : null,
        createdBy: comment.createdBy || '',
        updatedAt: comment.updatedAt ? comment.updatedAt.toISOString() : null,
        updatedBy: comment.updatedBy || '',
        deletedAt: comment.deletedAt ? comment.deletedAt.toISOString() : null,
        deletedBy: comment.deletedBy || '',
        postId: comment.postId,
        userId: comment.userId,
      };
    } catch (error) {
      this.logger.error('Error in update: ${error.message}', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new RpcException(error.message);
    }
  }

  async remove(id: string): Promise<DeleteCommentResponse> {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    await this.entityManager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.softDelete(LikeComment, {
        commentId: id,
      });
      await transactionalEntityManager.softDelete(Comment, id);
    });

    await this.commentsRepository.softDelete(id);
    return { data: null, message: 'Comment deletion successful' };
  }

  //CLOUDINARY
  async deleteOldMediaPath(comment: Comment): Promise<void> {
    if (comment.mediaPath && comment.mediaPath.length > 0) {
      await Promise.all(
        comment.mediaPath.map(async (url) => {
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
