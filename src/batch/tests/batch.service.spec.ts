/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { BatchService } from '../batch.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Batch } from '../batch.schema';
import { BadRequestException } from '@nestjs/common';

describe('BatchService', () => {
  let batchService: BatchService;
  let batchModel: Model<Batch>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchService,
        {
          provide: getModelToken(Batch.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findOneAndDelete: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    batchService = module.get<BatchService>(BatchService);
    batchModel = module.get<Model<Batch>>(getModelToken(Batch.name));
  });

  describe('createNewBatch', () => {
    test('should create a new batch', async () => {
      const dto = { year: 2023, branches: [], totalEnrolledStudents: 0 };
      const result = { year: 2023, branches: [], totalEnrolledStudents: 0 };

      jest.spyOn(batchModel, 'create').mockResolvedValue(result as any);

      expect(await batchService.createNewBatch(dto)).toEqual(result);
      expect(batchModel.create).toHaveBeenCalledWith(dto);
    });

    test('should throw error if no created', async () => {
      const dto = { year: 2023, branches: [], totalEnrolledStudents: 0 };
      jest.spyOn(batchModel, 'create').mockResolvedValue(null);

      await expect(batchService.createNewBatch(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('addNewBranch', () => {
    test('should add a new branch to a batch', async () => {
      const batch = {
        year: 2023,
        branches: [],
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(batchModel, 'findOne').mockResolvedValue(batch as any);

      const result = await batchService.addNewBranch({
        year: 2023,
        name: 'CE',
        totalStudentsIntake: 60,
        currentSeatCount: 50,
      });

      expect(result.branches.length).toBe(1);
    });
  });

  describe('deleteBatch', () => {
    test('should delete a batch by year', async () => {
      const batch = { year: 2023 };
      jest.spyOn(batchModel, 'findOneAndDelete').mockResolvedValue(batch as any);

      const result = await batchService.deleteBatch(2023);

      expect(result).toEqual(batch);
    });
  });

});
