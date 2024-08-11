import { Controller } from '@nestjs/common';
import { LikeService } from './like.service';
import { GetLikeParams } from './dto/getList-like.dto';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CheckLikeExistsRequest,
  CheckLikeExistsResponse,
  CreateLikeRequest,
  DeleteLikeRequest,
  DeleteLikeResponse,
  GetLikeIdRequest,
  LikeResponse,
  ManyLikeResponse,
} from 'src/common/interface/like.interface';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  //GET ALL LIKE
  @GrpcMethod('PostService', 'GetAllLike')
  async findAll(data: GetLikeParams): Promise<ManyLikeResponse> {
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

  //DELETE LIKE
  @GrpcMethod('PostService', 'DeleteLike')
  async delete(request: DeleteLikeRequest): Promise<DeleteLikeResponse> {
    const { id } = request;
    return this.likeService.remove(id);
  }
}
