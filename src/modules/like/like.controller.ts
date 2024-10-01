import { Controller } from '@nestjs/common';
import { LikeService } from './like.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CheckLikeExistsRequest,
  CheckLikeExistsResponse,
  CreateLikeRequest,
  GetAllLikesRequest,
  GetLikeIdRequest,
  LikeResponse,
  LikesResponse,
  ToggleLikeResponse,
} from '../../common/interface/like.interface';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  //GET ALL LIKE
  @GrpcMethod('PostService', 'GetAllLikes')
  async findAll(data: GetAllLikesRequest): Promise<LikesResponse> {
    return this.likeService.getLike(data);
  }

  //GET LIKE BY ID
  @GrpcMethod('PostService', 'GetLikeId')
  async findOneById(data: GetLikeIdRequest): Promise<LikeResponse> {
    return this.likeService.getLikeById(data);
  }

  //CREATE LIKE
  @GrpcMethod('PostService', 'CreateLike')
  async createLike(data: CreateLikeRequest): Promise<LikeResponse> {
    return this.likeService.create(data);
  }

  //CHECK LIKE EXISTS
  @GrpcMethod('PostService', 'CheckLikeExists')
  checkExists(data: CheckLikeExistsRequest): Promise<CheckLikeExistsResponse> {
    return this.likeService.checkLikeExists(data);
  }

  //TOGGLE LIKE
  @GrpcMethod('PostService', 'ToggleLike')
  async toggleLike(request: {
    postId: string;
    userId: string;
  }): Promise<ToggleLikeResponse> {
    return this.likeService.toggleLike(request.postId, request.userId);
  }
}
