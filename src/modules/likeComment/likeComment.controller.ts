import { Controller } from '@nestjs/common';
import { LikeCommentService } from './likeComment.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CheckLikeCommentExistsRequest,
  CheckLikeCommentExistsResponse,
  CreateLikeCommentRequest,
  GetAllLikesCommentRequest,
  GetLikeCommentIdRequest,
  LikeCommentResponse,
  LikesCommentResponse,
  ToggleLikeCommentResponse,
} from 'src/common/interface/likeComment.interface';

@Controller('like-comment')
export class LikeCommentController {
  constructor(private readonly likeCommentService: LikeCommentService) {}

  //GET ALL LIKE COMMENT
  @GrpcMethod('PostService', 'GetAllLikesComment')
  async findAll(
    data: GetAllLikesCommentRequest,
  ): Promise<LikesCommentResponse> {
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

  //TOGGLE LIKE
  @GrpcMethod('PostService', 'ToggleLikeComment')
  async toggleLikeComment(request: {
    commentId: string;
    userId: string;
  }): Promise<ToggleLikeCommentResponse> {
    return this.likeCommentService.toggle(request.commentId, request.userId);
  }
}
