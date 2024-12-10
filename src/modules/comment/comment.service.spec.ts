import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import {
  CommentsResponse,
  GetAllCommentsRequest,
} from '../../common/interface/comment.interface';

describe('CommentController', () => {
  let commentController: CommentController;
  let commentService: CommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: {
            commentsRepository: {
              softDelete: jest.fn(),
            },
            entityManager: {
              transaction: jest.fn(),
            },
            getComments: jest.fn(),
            getCommentById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    commentController = module.get<CommentController>(CommentController);
    commentService = module.get<CommentService>(CommentService);
  });

  describe('findAll', () => {
    it('should return a list of comments', async () => {
      const request: GetAllCommentsRequest = {
        page: 1,
        take: 10,
        skip: 0,
        postId: '123',
        userId: '456',
      };

      const response: CommentsResponse = {
        data: [],
        meta: {
          page: 1,
          take: 10,
          itemCount: 0,
          pageCount: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
        message: 'Success',
      };

      jest.spyOn(commentService, 'getComments').mockResolvedValue(response);

      const result = await commentController.findAll(request);

      expect(result).toEqual(response);
      expect(commentService.getComments).toHaveBeenCalledWith(request);
    });
  });

  describe('create', () => {
    it('should create a comment and return it', async () => {
      const request = {
        content: 'This is a test comment',
        mediaPath: [
          'https://i.pinimg.com/736x/f2/81/4a/f2814a7a96aa33782023b04d522280cf.jpg',
        ],
        postId: '123',
        userId: '456',
      };

      const modifiedRequest = {
        ...request,
        mediaPath: request.mediaPath.map((url) => Buffer.from(url)),
      };

      const response = {
        id: '1',
        ...request,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        deletedAt: null,
        createdBy: 'user1',
        updatedBy: null,
        deletedBy: null,
      };

      jest.spyOn(commentService, 'create').mockResolvedValue(response);

      const result = await commentController.create(modifiedRequest);

      expect(result).toEqual(response);
      expect(commentService.create).toHaveBeenCalledWith(modifiedRequest);
    });
  });

  describe('update', () => {
    it('should update a comment and return it', async () => {
      const request = {
        id: '1',
        content: 'Updated comment content',
        mediaPath: ['https://example.com/image.jpg'],
      };

      const modifiedRequest = {
        ...request,
        mediaPath: request.mediaPath.map((url) => Buffer.from(url)),
      };

      const response = {
        ...request,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: 'user1',
        updatedBy: 'user2',
        deletedBy: null,
        postId: '1',
        userId: 'user456',
      };

      jest.spyOn(commentService, 'update').mockResolvedValue(response);

      const result = await commentController.update(modifiedRequest);

      expect(result).toEqual(response);

      expect(commentService.update).toHaveBeenCalledWith(modifiedRequest);
    });
  });
});
