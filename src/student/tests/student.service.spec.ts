/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from '../student.service';
import { Student } from '../student.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { createStudentDto } from '../input/create-student.dto';
import { updateStudentDto } from '../input/update-student.dto';

const mockStudentModel = {
  create: jest.fn(),
  find: jest.fn(),
  findOneAndDelete: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOne: jest.fn(),
};

const mockBatchHelper = {
  checkSeat: jest.fn(),
  updateSeatCount: jest.fn(),
};

const mockStudent = {
  _id: 'testStudentId',
  name: 'Jane Doe',
  rollNumber: '21ce011',
  mobileNumber: 9876543210,
  department: 'CE',
  batch: 2023,
  currentSemester: 2,
  role: 'student',
};

describe('StudentService', () => {
  let service: StudentService;
  let studentModel: Model<Student>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: getModelToken(Student.name), useValue: mockStudentModel },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
    studentModel = module.get<Model<Student>>(getModelToken(Student.name));
  });

  describe('createNewStudent', () => {
    test('should create a new student', async () => {
      mockBatchHelper.checkSeat.mockResolvedValue(true);
      mockStudentModel.create.mockResolvedValue(mockStudent);

      const result = await service.createNewStudent(
        mockStudent as createStudentDto,
      );
      expect(result).toEqual(mockStudent);
      expect(mockBatchHelper.checkSeat).toHaveBeenCalledWith(
        mockStudent.department,
        mockStudent.batch,
      );
      expect(mockBatchHelper.updateSeatCount).toHaveBeenCalledWith({
        department: mockStudent.department,
        batch: mockStudent.batch,
        count: 1,
      });
    });

    describe('getStudentByDetails', () => {
      test('should return a list of students', async () => {
        mockStudentModel.find.mockResolvedValue([mockStudent]);

        const result = await service.getStudentByDetails({});
        expect(result).toEqual([mockStudent]);
      });

      test('should not return students if no students are found', async () => {
        mockStudentModel.find.mockResolvedValue([]);

        await expect(service.getStudentByDetails({})).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('deleteStudent', () => {
      test('should delete a student by roll number', async () => {
        mockStudentModel.findOneAndDelete.mockResolvedValue(mockStudent);
        mockBatchHelper.updateSeatCount.mockResolvedValue(null);

        const result = await service.deleteStudent('21ce011');
        expect(result).toEqual(mockStudent);
        expect(mockBatchHelper.updateSeatCount).toHaveBeenCalledWith({
          department: mockStudent.department,
          batch: mockStudent.batch,
          count: -1,
        });
      });

      test('should not delete student if student does not exist', async () => {
        mockStudentModel.findOneAndDelete.mockResolvedValue(null);

        await expect(service.deleteStudent('INVALIDROLL')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateStudent', () => {
      test('should update a student', async () => {
        mockStudentModel.findOneAndUpdate.mockResolvedValue(mockStudent);

        const result = await service.updateStudent(
          '21ce057',
          mockStudent as updateStudentDto,
        );
        expect(result).toEqual(mockStudent);
      });

      test('should not update student if student does not exist', async () => {
        mockStudentModel.findOneAndUpdate.mockResolvedValue(null);

        await expect(
          service.updateStudent('INVALIDROLL', mockStudent as updateStudentDto),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('getStudent', () => {
      test('should return a student by roll number', async () => {
        mockStudentModel.findOne.mockResolvedValue(mockStudent);

        const result = await service.getStudent({ rollNumber: '21ce011' });
        expect(result).toEqual(mockStudent);
      });

      test('should not get student if student does not exist', async () => {
        mockStudentModel.findOne.mockResolvedValue(null);

        await expect(
          service.getStudent({ rollNumber: 'INVALIDROLL' }),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });
});
