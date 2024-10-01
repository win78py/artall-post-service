import { Injectable } from '@nestjs/common';
import { LikeComment } from '../../entities/likeComment.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../../common/enum/enum';
import {
  CheckLikeCommentExistsRequest,
  CheckLikeCommentExistsResponse,
  CreateLikeCommentRequest,
  LikeCommentResponse,
  GetLikeCommentIdRequest,
  LikesCommentResponse,
  PageMeta,
  GetAllLikesCommentRequest,
  ToggleLikeCommentResponse,
} from '../../common/interface/likeComment.interface';

@Injectable()
export class LikeCommentService {
  constructor(
    @InjectRepository(LikeComment)
    private readonly likeCommentRepository: Repository<LikeComment>,
    private readonly entityManager: EntityManager,
  ) {}

  async getLikeComment(
    params: GetAllLikesCommentRequest,
  ): Promise<LikesCommentResponse> {
    const likeComment = this.likeCommentRepository
      .createQueryBuilder('likeComment')
      .select(['likeComment'])
      .skip(params.skip)
      .take(params.take)
      .orderBy('likeComment.createdAt', Order.DESC);
    if (params.comment) {
      likeComment.andWhere('likeComment.commentId = :commentId', {
        commentId: params.comment,
      });
    }
    const [result, total] = await likeComment.getManyAndCount();
    const data: LikeCommentResponse[] = result.map((likeComment) => ({
      id: likeComment.id,
      commentId: likeComment.commentId,
      userId: likeComment.userId,
      createdAt: likeComment.createdAt
        ? likeComment.createdAt.toISOString()
        : null,
      createdBy: likeComment.createdBy || null,
      updatedAt: likeComment.updatedAt
        ? likeComment.updatedAt.toISOString()
        : null,
      updatedBy: likeComment.updatedBy || null,
      deletedAt: likeComment.deletedAt
        ? likeComment.deletedAt.toISOString()
        : null,
      deletedBy: likeComment.deletedBy || null,
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

  async getLikeCommentById(
    request: GetLikeCommentIdRequest,
  ): Promise<LikeCommentResponse> {
    const likeComment = await this.likeCommentRepository
      .createQueryBuilder('likeComment')
      .select(['likeComment'])
      .where('likeComment.id = :id', { id: request.id })
      .getOne();
    return {
      id: likeComment.id,
      commentId: likeComment.commentId,
      userId: likeComment.userId,
      createdAt: likeComment.createdAt
        ? likeComment.createdAt.toISOString()
        : null,
      createdBy: likeComment.createdBy || null,
      updatedAt: likeComment.updatedAt
        ? likeComment.updatedAt.toISOString()
        : null,
      updatedBy: likeComment.updatedBy || null,
      deletedAt: likeComment.deletedAt
        ? likeComment.deletedAt.toISOString()
        : null,
      deletedBy: likeComment.deletedBy || null,
    };
  }

  async create(data: CreateLikeCommentRequest): Promise<LikeCommentResponse> {
    const likeComment = this.likeCommentRepository.create({
      ...data,
    });

    await this.likeCommentRepository.save(likeComment);

    return {
      id: likeComment.id,
      commentId: likeComment.commentId,
      userId: likeComment.userId,
      createdAt: likeComment.createdAt
        ? likeComment.createdAt.toISOString()
        : null,
      createdBy: likeComment.createdBy || null,
      updatedAt: likeComment.updatedAt
        ? likeComment.updatedAt.toISOString()
        : null,
      updatedBy: likeComment.updatedBy || null,
      deletedAt: likeComment.deletedAt
        ? likeComment.deletedAt.toISOString()
        : null,
      deletedBy: likeComment.deletedBy || null,
    };
  }

  async remove(id: string): Promise<void> {
    await this.likeCommentRepository.delete(id);
  }

  async checkLikeCommentExists(
    data: CheckLikeCommentExistsRequest,
  ): Promise<CheckLikeCommentExistsResponse> {
    const likeComment = await this.likeCommentRepository.findOne({
      where: { id: data.id },
    });
    return { exists: !!likeComment };
  }

  async toggle(
    commentId: string,
    userId: string,
  ): Promise<ToggleLikeCommentResponse> {
    const existingLikeComment = await this.likeCommentRepository.findOne({
      where: { commentId, userId },
    });

    if (existingLikeComment) {
      await this.remove(existingLikeComment.id);
      return {
        data: null,
        message: 'Like Comment removed',
      };
    } else {
      const likeComment = await this.create({ commentId, userId });
      return {
        data: likeComment,
        message: 'Like Comment added',
      };
    }
  }
}
