import { BadRequestException, Injectable } from '@nestjs/common';
import { Like } from 'src/entities/like.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/common/enum/enum';
import { validate as uuidValidate } from 'uuid';
import {
  CheckLikeExistsRequest,
  CheckLikeExistsResponse,
  CreateLikeRequest,
  LikeResponse,
  GetLikeIdRequest,
  ManyLikeResponse,
  PageMeta,
} from 'src/common/interface/like.interface';
import { GetLikeParams } from './dto/getList-like.dto';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    private readonly entityManager: EntityManager,
  ) {}

  async getLike(params: GetLikeParams): Promise<ManyLikeResponse> {
    const like = this.likeRepository
      .createQueryBuilder('like')
      .select(['like'])
      .skip(params.skip)
      .take(params.take)
      .orderBy('like.createdAt', Order.DESC);
    if (params.search) {
      like.andWhere('like.postId ILIKE :postId', {
        like: `%${params.search}%`,
      });
    }
    const [result, total] = await like.getManyAndCount();
    const data: LikeResponse[] = result.map((like) => ({
      id: like.id,
      postId: like.postId,
      userId: like.userId,
      createdAt: like.createdAt ? like.createdAt.toISOString() : null,
      createdBy: like.createdBy || null,
      updatedAt: like.updatedAt ? like.updatedAt.toISOString() : null,
      updatedBy: like.updatedBy || null,
      deletedAt: like.deletedAt ? like.deletedAt.toISOString() : null,
      deletedBy: like.deletedBy || null,
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

  async getLikeById(request: GetLikeIdRequest): Promise<LikeResponse> {
    const like = await this.likeRepository
      .createQueryBuilder('like')
      .select(['like'])
      .where('like.id = :id', { id: request.id })
      .getOne();
    return {
      id: like.id,
      postId: like.postId,
      userId: like.userId,
      createdAt: like.createdAt ? like.createdAt.toISOString() : null,
      createdBy: like.createdBy || null,
      updatedAt: like.updatedAt ? like.updatedAt.toISOString() : null,
      updatedBy: like.updatedBy || null,
      deletedAt: like.deletedAt ? like.deletedAt.toISOString() : null,
      deletedBy: like.deletedBy || null,
    };
  }

  async create(data: CreateLikeRequest): Promise<LikeResponse> {
    const like = this.likeRepository.create({
      ...data,
    });

    await this.likeRepository.save(like);

    return {
      id: like.id,
      postId: like.postId,
      userId: like.userId,
      createdAt: like.createdAt ? like.createdAt.toISOString() : null,
      createdBy: like.createdBy || null,
      updatedAt: like.updatedAt ? like.updatedAt.toISOString() : null,
      updatedBy: like.updatedBy || null,
      deletedAt: like.deletedAt ? like.deletedAt.toISOString() : null,
      deletedBy: like.deletedBy || null,
    };
  }

  async checkLikeExists(
    data: CheckLikeExistsRequest,
  ): Promise<CheckLikeExistsResponse> {
    const like = await this.likeRepository.findOne({
      where: { id: data.id },
    });
    return { exists: !!like };
  }

  async remove(id: string) {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    await this.likeRepository
      .createQueryBuilder('like')
      .where('like.id = :id', { id })
      .getOne();
    await this.likeRepository.softDelete(id);
    return { data: null, message: 'Like deletion successful' };
  }
}
