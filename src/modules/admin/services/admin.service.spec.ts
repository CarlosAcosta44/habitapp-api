import { Test, TestingModule } from "@nestjs/testing";
import { AdminService } from "./admin.service";
import { AdminRepository } from "../repositories/admin.repository";
import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

describe("AdminService", () => {
  let service: AdminService;
  let adminRepository: jest.Mocked<AdminRepository>;

  beforeEach(async () => {
    const mockAdminRepository = {
      getForum: jest.fn(),
      getForumComments: jest.fn(),
      deleteForumAdmins: jest.fn(),
      deleteForumSubscriptions: jest.fn(),
      deleteReactionsForComments: jest.fn(),
      deleteComments: jest.fn(),
      deleteForum: jest.fn(),
      getComment: jest.fn(),
      deleteComment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: AdminRepository,
          useValue: mockAdminRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    adminRepository = module.get(AdminRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("deleteForum", () => {
    const forumId = "uuid-1";

    it("should throw NotFoundException if forum does not exist", async () => {
      adminRepository.getForum.mockRejectedValue(
        new NotFoundException(`Forum with ID ${forumId} not found`),
      );

      await expect(service.deleteForum(forumId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw InternalServerErrorException if delete fails", async () => {
      adminRepository.getForum.mockResolvedValue({ idforo: forumId } as any);
      adminRepository.getForumComments.mockResolvedValue([]);
      adminRepository.deleteForumAdmins.mockResolvedValue(undefined as any);
      adminRepository.deleteForumSubscriptions.mockResolvedValue(undefined as any);
      adminRepository.deleteForum.mockRejectedValue(
        new InternalServerErrorException("DB Error"),
      );

      await expect(service.deleteForum(forumId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it("should delete forum successfully with cascading comments", async () => {
      adminRepository.getForum.mockResolvedValue({ idforo: forumId } as any);
      adminRepository.getForumComments.mockResolvedValue([
        { idcomentario: "c-1" },
      ] as any);
      adminRepository.deleteForumAdmins.mockResolvedValue(undefined as any);
      adminRepository.deleteForumSubscriptions.mockResolvedValue(undefined as any);
      adminRepository.deleteReactionsForComments.mockResolvedValue(undefined as any);
      adminRepository.deleteComments.mockResolvedValue(undefined as any);
      adminRepository.deleteForum.mockResolvedValue(undefined as any);

      const result = await service.deleteForum(forumId);
      expect(result).toEqual({
        message: "Forum and its comments deleted successfully",
      });
      expect(adminRepository.deleteReactionsForComments).toHaveBeenCalledWith(["c-1"]);
      expect(adminRepository.deleteComments).toHaveBeenCalledWith(["c-1"]);
      expect(adminRepository.deleteForum).toHaveBeenCalledWith(forumId);
    });
  });

  describe("deleteForumComment", () => {
    const commentId = "uuid-c1";

    it("should throw NotFoundException if comment does not exist", async () => {
      adminRepository.getComment.mockRejectedValue(
        new NotFoundException(`Comment with ID ${commentId} not found`),
      );

      await expect(service.deleteForumComment(commentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should delete comment successfully", async () => {
      adminRepository.getComment.mockResolvedValue({ idcomentario: commentId } as any);
      adminRepository.deleteComment.mockResolvedValue(undefined as any);

      const result = await service.deleteForumComment(commentId);
      expect(result).toEqual({ message: "Comment deleted successfully" });
      expect(adminRepository.deleteComment).toHaveBeenCalledWith(commentId);
    });
  });
});
