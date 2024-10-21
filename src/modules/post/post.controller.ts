import { Controller } from '@nestjs/common';
import { PostService } from './post.service';
import { GetPostParams } from './dto/getList-post.dto';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CheckPostExistsRequest,
  CheckPostExistsResponse,
  CreatePostRequest,
  DeletePostRequest,
  DeletePostResponse,
  GetPostIdRequest,
  PostInfoResponse,
  PostResponse,
  PostsResponse,
  RandomPostsResponse,
  UpdatePostRequest,
} from '../../common/interface/post.interface';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  //GET ALL POSTS
  @GrpcMethod('PostService', 'GetAllPosts')
  async findAll(data: GetPostParams): Promise<PostsResponse> {
    return this.postService.getPosts(data);
  }

  //GET RANDOM POSTS
  @GrpcMethod('PostService', 'GetRandomPosts')
  async findRandomPost(data: GetPostParams): Promise<RandomPostsResponse> {
    return this.postService.getRandomPosts(data);
  }

  //GET POST BY ID
  @GrpcMethod('PostService', 'GetPostId')
  async findOneById(data: GetPostIdRequest): Promise<PostInfoResponse> {
    return this.postService.getPostById(data);
  }

  //CREATE POST
  @GrpcMethod('PostService', 'CreatePost')
  async create(data: CreatePostRequest): Promise<PostResponse> {
    return this.postService.create(data);
  }

  //CHECK POST EXISTS
  @GrpcMethod('PostService', 'CheckPostExists')
  checkExists(data: CheckPostExistsRequest): Promise<CheckPostExistsResponse> {
    return this.postService.checkPostExists(data);
  }

  //UPDATE POST
  @GrpcMethod('PostService', 'UpdatePost')
  async update(data: UpdatePostRequest): Promise<PostResponse> {
    return this.postService.update(data);
  }

  //DELETE POST
  @GrpcMethod('PostService', 'DeletePost')
  async delete(request: DeletePostRequest): Promise<DeletePostResponse> {
    const { id } = request;
    return this.postService.remove(id);
  }
}
