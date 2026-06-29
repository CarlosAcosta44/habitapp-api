import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { SupabaseService } from '../supabase/supabase.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  // Create mock objects for the builder pattern of Supabase JS client
  let mockDelete: jest.Mock;
  let mockSelect: jest.Mock;
  let mockEq: jest.Mock;
  let mockSingle: jest.Mock;
  let mockFrom: jest.Mock;
  let mockSchema: jest.Mock;
  let mockChain: any;

  beforeEach(async () => {
    mockDelete = jest.fn();
    mockSelect = jest.fn();
    mockEq = jest.fn();
    mockSingle = jest.fn();

    mockChain = {
      select: mockSelect,
      delete: mockDelete,
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: mockEq,
      single: mockSingle,
    };

    mockDelete.mockReturnValue(mockChain);
    mockSelect.mockReturnValue(mockChain);
    mockEq.mockReturnValue(mockChain);
    mockSingle.mockReturnValue(mockChain);

    mockFrom = jest.fn().mockReturnValue(mockChain);
    mockSchema = jest.fn().mockReturnValue({ from: mockFrom });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn().mockReturnValue({
              schema: mockSchema,
              from: mockFrom,
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteForum', () => {
    const forumId = 'uuid-1';

    it('should throw NotFoundException if forum does not exist', async () => {
      mockFrom.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      }));

      await expect(service.deleteForum(forumId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      mockFrom.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: jest
              .fn()
              .mockResolvedValue({ data: { idforo: forumId }, error: null }),
          }),
        }),
        delete: () => ({
          eq: jest
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'DB Error' } }),
        }),
      }));

      await expect(service.deleteForum(forumId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should delete forum successfully', async () => {
      mockFrom.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: jest
              .fn()
              .mockResolvedValue({ data: { idforo: forumId }, error: null }),
          }),
        }),
        delete: () => ({
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }));

      const result = await service.deleteForum(forumId);
      expect(result).toEqual({
        message: 'Forum and its comments deleted successfully',
      });
    });
  });

  describe('deleteForumComment', () => {
    const commentId = 'uuid-c1';

    it('should throw NotFoundException if comment does not exist', async () => {
      mockFrom.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      }));

      await expect(service.deleteForumComment(commentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete comment successfully', async () => {
      mockFrom.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: jest.fn().mockResolvedValue({
              data: { idcomentario: commentId },
              error: null,
            }),
          }),
        }),
        delete: () => ({
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }));

      const result = await service.deleteForumComment(commentId);
      expect(result).toEqual({ message: 'Comment deleted successfully' });
    });
  });
});
