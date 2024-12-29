/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { StudentController } from '../student.controller';
import { StudentService } from '../student.service';
import { createStudentDto } from '../input/create-student.dto';
import { updateStudentDto } from '../input/update-student.dto';
import {  NotFoundException } from '@nestjs/common';

const mockStudentService = {
  createNewStudent: jest.fn(),
  getStudentByDetails: jest.fn(),
  deleteStudent: jest.fn(),
  updateStudent: jest.fn(),
  getStudent: jest.fn(),
  getStudentAnalyticsData: jest.fn(),
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

describe('StudentController', () => {
  let controller: StudentController;
  let studentService: StudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentController],
      providers: [
        { provide: StudentService, useValue: mockStudentService },
      ],
    }).compile();

    controller = module.get<StudentController>(StudentController);
    studentService = module.get<StudentService>(StudentService);
  });

  describe('createStudent', () => {
    test('should create a new student', async () => {
      mockStudentService.createNewStudent.mockResolvedValue(mockStudent);

      const result = await controller.createStudent(
        mockStudent as createStudentDto,
      );
      expect(result).toEqual(mockStudent);
    });
  });

  describe('getStudents', () => {
    test('should get students', async () => {
      mockStudentService.getStudentByDetails.mockResolvedValue([mockStudent]);

      const result = await controller.getStudents();
      expect(result).toEqual([mockStudent]);
    });
  });

  describe('deleteStudent', () => {
    test('should delete a student by roll number', async () => {
      mockStudentService.deleteStudent.mockResolvedValue(mockStudent);

      const result = await controller.deleteStudent('21ce011');
      expect(result).toEqual(mockStudent);
    });

    test('should not delete if student does not exist', async () => {
      mockStudentService.deleteStudent.mockRejectedValue(
        new NotFoundException('Student does not exists'),
      );

      await expect(controller.deleteStudent('INVALIDROLL')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStudent', () => {
    test('should update a student', async () => {
      mockStudentService.updateStudent.mockResolvedValue(mockStudent);

      const result = await controller.updateStudent(
        '21ce011',
        mockStudent as updateStudentDto,
      );
      expect(result).toEqual(mockStudent);
    });

    test('should not update if student does not exist', async () => {
      mockStudentService.updateStudent.mockRejectedValue(
        new NotFoundException('Student not updated'),
      );

      await expect(
        controller.updateStudent(
          'INVALIDROLL',
          mockStudent as updateStudentDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStudent', () => {
    test('should get a student by roll number', async () => {
      mockStudentService.getStudent.mockResolvedValue(mockStudent);

      const result = await controller.getStudent('21ce011');
      expect(result).toEqual(mockStudent);
    });

  });
});
