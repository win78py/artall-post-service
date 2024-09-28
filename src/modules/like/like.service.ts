import { Injectable } from '@nestjs/common';
import { Like } from 'src/entities/like.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/common/enum/enum';
import {
  CheckLikeExistsRequest,
  CheckLikeExistsResponse,
  CreateLikeRequest,
  LikeResponse,
  GetLikeIdRequest,
  LikesResponse,
  PageMeta,
  GetAllLikesRequest,
  ToggleLikeResponse,
} from 'src/common/interface/like.interface';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    private readonly entityManager: EntityManager,
  ) {}

  async getLike(params: GetAllLikesRequest): Promise<LikesResponse> {
    const like = this.likeRepository
      .createQueryBuilder('like')
      .select(['like'])
      .skip(params.skip)
      .take(params.take)
      .orderBy('like.createdAt', Order.DESC);
    if (params.post) {
      like.andWhere('like.postId = :postId', {
        postId: params.post,
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
    const like = this.likeRepository.create(data);
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

  async remove(id: string): Promise<void> {
    await this.likeRepository.delete(id);
  }

  async checkLikeExists(
    data: CheckLikeExistsRequest,
  ): Promise<CheckLikeExistsResponse> {
    const like = await this.likeRepository.findOne({ where: { id: data.id } });
    return { exists: !!like };
  }

  async toggleLike(
    postId: string,
    userId: string,
  ): Promise<ToggleLikeResponse> {
    const existingLike = await this.likeRepository.findOne({
      where: { postId, userId },
    });

    if (existingLike) {
      await this.remove(existingLike.id);
      return {
        data: null,
        message: 'Like removed',
      };
    } else {
      const like = await this.create({ postId, userId });
      return {
        data: like,
        message: 'Like added',
      };
    }
  }
}
