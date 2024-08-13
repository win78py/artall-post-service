import { Controller } from '@nestjs/common';
import { LikeCommentService } from './likeComment.service';
import { GetLikeCommentParams } from './dto/getList-likeComment.dto';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CheckLikeCommentExistsRequest,
  CheckLikeCommentExistsResponse,
  CreateLikeCommentRequest,
  DeleteLikeCommentRequest,
  DeleteLikeCommentResponse,
  GetLikeCommentIdRequest,
  LikeCommentResponse,
  LikesCommentResponse,
} from 'src/common/interface/likeComment.interface';

@Controller('like-comment')
export class LikeCommentController {
  constructor(private readonly likeCommentService: LikeCommentService) {}

  //GET ALL LIKE COMMENT
  @GrpcMethod('PostService', 'GetAllLikesComment')
  async findAll(data: GetLikeCommentParams): Promise<LikesCommentResponse> {
    return this.likeCommentService.getLikeComment(data);
  }

  //GET LIKE COMMENT BY ID
  @GrpcMethod('PostService', 'GetLikeCommentId')
  async findOneById(
    data: GetLikeCommentIdRequest,
  ): Promise<LikeCommentResponse> {
    return this.likeCommentService.getLikeCommentById(data);
  }

  //CREATE LIKE COMMENT
  @GrpcMethod('PostService', 'CreateLikeComment')
  async createLikeComment(
    data: CreateLikeCommentRequest,
  ): Promise<LikeCommentResponse> {
    return this.likeCommentService.create(data);
  }

  //CHECK LIKE COMMENT EXISTS
  @GrpcMethod('PostService', 'CheckLikeCommentExists')
  checkExists(
    data: CheckLikeCommentExistsRequest,
  ): Promise<CheckLikeCommentExistsResponse> {
    return this.likeCommentService.checkLikeCommentExists(data);
  }

  //DELETE LIKE COMMENT
  @GrpcMethod('PostService', 'DeleteLikeComment')
  async delete(
    request: DeleteLikeCommentRequest,
  ): Promise<DeleteLikeCommentResponse> {
    const { id } = request;
    return this.likeCommentService.remove(id);
  }
}
