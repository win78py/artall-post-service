import { BadRequestException, Injectable } from '@nestjs/common';
import { LikeComment } from 'src/entities/likeComment.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/common/enum/enum';
import { validate as uuidValidate } from 'uuid';
import {
  CheckLikeCommentExistsRequest,
  CheckLikeCommentExistsResponse,
  CreateLikeCommentRequest,
  LikeCommentResponse,
  GetLikeCommentIdRequest,
  LikesCommentResponse,
  PageMeta,
} from '../../common/interface/likeComment.interface';
import { GetLikeCommentParams } from './dto/getList-likeComment.dto';

@Injectable()
export class LikeCommentService {
  constructor(
    @InjectRepository(LikeComment)
    private readonly likeCommentRepository: Repository<LikeComment>,
    private readonly entityManager: EntityManager,
  ) {}

  async getLikeComment(
    params: GetLikeCommentParams,
  ): Promise<LikesCommentResponse> {
    const likeComment = this.likeCommentRepository
      .createQueryBuilder('likeComment')
      .select(['likeComment'])
      .skip(params.skip)
      .take(params.take)
      .orderBy('likeComment.createdAt', Order.DESC);
    if (params.search) {
      likeComment.andWhere('likeComment.likecommentId ILIKE :commentId', {
        likeComment: `%${params.search}%`,
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

  async checkLikeCommentExists(
    data: CheckLikeCommentExistsRequest,
  ): Promise<CheckLikeCommentExistsResponse> {
    const likeComment = await this.likeCommentRepository.findOne({
      where: { id: data.id },
    });
    return { exists: !!likeComment };
  }

  async remove(id: string) {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    await this.likeCommentRepository
      .createQueryBuilder('likeComment')
      .where('likeComment.id = :id', { id })
      .getOne();
    await this.likeCommentRepository.softDelete(id);
    return { data: null, message: 'Like Comment deletion successful' };
  }
}
