/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { BatchController } from '../batch.controller';
import { BatchService } from '../batch.service';
import { createBatchDto, createBranchDto } from '../input/create-batch.dto';

describe('BatchController', () => {
  let batchController: BatchController;
  let batchService: BatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchController],
      providers: [
        {
          provide: BatchService,
          useValue: {
            createNewBatch: jest.fn(),
            addNewBranch: jest.fn(),
            getBatches: jest.fn(),
            deleteBatch: jest.fn(),
            updateBatch: jest.fn(),
            getVacantSeatsByYear: jest.fn(),
          },
        },
      ],
    }).compile();

    batchController = module.get<BatchController>(BatchController);
    batchService = module.get<BatchService>(BatchService);
  });

  describe('createBatch', () => {
    test('should create a new batch', async () => {
      const dto: createBatchDto = {
        year: 2023,
        branches: [],
        totalEnrolledStudents: 0,
      };
      const result: any = { ...dto };

      jest.spyOn(batchService, 'createNewBatch').mockResolvedValue(result);

      expect(await batchController.createBatch(dto)).toEqual(result);
      expect(batchService.createNewBatch).toHaveBeenCalledWith(dto);
    });
  });

  describe('addBranch', () => {
    test('should add a branch in batch', async () => {
      const dto: createBranchDto = {
        name: 'CSE',
        totalStudentsIntake: 60,
        currentSeatCount: 50,
      };
      const result: any = {
        year: 2023,
        branches: [dto],
        totalEnrolledStudents: 50,
      };

      jest.spyOn(batchService, 'addNewBranch').mockResolvedValue(result);

      expect(await batchController.addBranch(2023, dto)).toEqual(result);
      expect(batchService.addNewBranch).toHaveBeenCalledWith({
        year: 2023,
        ...dto,
      });
    });
  });

  describe('getBatches', () => {
    test('should return batches', async () => {
      const result: any = [
        {
          year: 2023,
          branches: [],
          totalEnrolledStudents: 0,
        },
      ];

      jest.spyOn(batchService, 'getBatches').mockResolvedValue(result);

      expect(await batchController.getBatch()).toEqual(result);
      expect(batchService.getBatches).toHaveBeenCalled();
    });
  });

  describe('deleteBatch', () => {
    test('should delete batch', async () => {
      const result: any = { year: 2023 };

      jest.spyOn(batchService, 'deleteBatch').mockResolvedValue(result);

      expect(await batchController.deleteBatch(2023)).toEqual(result);
      expect(batchService.deleteBatch).toHaveBeenCalledWith(2023);
    });
  });
});
