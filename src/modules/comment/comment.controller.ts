import { Controller } from '@nestjs/common';
import { CommentService } from './comment.service';
import { GetCommentParams } from './dto/getList-comment.dto';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CheckCommentExistsRequest,
  CheckCommentExistsResponse,
  CreateCommentRequest,
  DeleteCommentRequest,
  DeleteCommentResponse,
  GetCommentIdRequest,
  CommentResponse,
  CommentsResponse,
  UpdateCommentRequest,
} from 'src/common/interface/comment.interface';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  //GET ALL COMMENTS
  @GrpcMethod('PostService', 'GetAllComments')
  async findAll(data: GetCommentParams): Promise<CommentsResponse> {
    return this.commentService.getComments(data);
  }

  //GET COMMENT BY ID
  @GrpcMethod('PostService', 'GetCommentId')
  async findOneById(data: GetCommentIdRequest): Promise<CommentResponse> {
    return this.commentService.getCommentById(data);
  }

  //CREATE COMMENT
  @GrpcMethod('PostService', 'CreateComment')
  async create(data: CreateCommentRequest): Promise<CommentResponse> {
    return this.commentService.create(data);
  }

  //CHECK COMMENT EXISTS
  @GrpcMethod('PostService', 'CheckCommentExists')
  checkExists(
    data: CheckCommentExistsRequest,
  ): Promise<CheckCommentExistsResponse> {
    return this.commentService.checkCommentExists(data);
  }

  //UPDATE COMMENT
  @GrpcMethod('PostService', 'UpdateComment')
  async update(data: UpdateCommentRequest): Promise<CommentResponse> {
    return this.commentService.update(data);
  }

  //DELETE COMMENT
  @GrpcMethod('PostService', 'DeleteComment')
  async delete(request: DeleteCommentRequest): Promise<DeleteCommentResponse> {
    const { id } = request;
    return this.commentService.remove(id);
  }
}
