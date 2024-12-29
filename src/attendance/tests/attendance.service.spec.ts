/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from '../attendance.service';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Attendance } from '../attendance.schema';
import { createAttendanceDto, deleteAttendanceDto } from '../input/attendance.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as moment from 'moment';
import { StudentService } from '../../student/student.service';

const mockAttendanceModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
};

const mockStudentService = {
  getStudent: jest.fn(),
};

describe('AttendanceService', () => {
  let service: AttendanceService;
  let attendanceModel: Model<Attendance>;
  let studentService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: getModelToken(Attendance.name),
          useValue: mockAttendanceModel,
        },
        { provide: StudentService, useValue: mockStudentService },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    attendanceModel = module.get<Model<Attendance>>(
      getModelToken(Attendance.name),
    );
    studentService = module.get<StudentService>(StudentService);
  });

  describe('addStudentAttendance', () => {
    test('should add attendance for a student', async () => {
      const input: createAttendanceDto = {
        rollNumber: '12345',
        date: '01-01-2024',
        isAbsent: 'absent',
      };

      jest.spyOn(studentService, 'getStudent').mockResolvedValue({});
      mockAttendanceModel.findOne.mockResolvedValue(null);
      mockAttendanceModel.create.mockResolvedValue(input);

      const result = await service.addAttendance(input);
      expect(result).toEqual(input);
    });

    test('should not add attendance if already exists', async () => {
      const input: createAttendanceDto = {
        rollNumber: '12345',
        date: '01-01-2024',
        isAbsent: 'absent',
      };

      jest.spyOn(studentService, 'getStudent').mockResolvedValue({});
      mockAttendanceModel.findOne.mockResolvedValue(input);

      await expect(service.addAttendance(input)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateStudentAttendance', () => {
    test('should update attendance for a student', async () => {
      const input: createAttendanceDto = {
        rollNumber: '12345',
        date: '01-01-2024',
        isAbsent: 'present',
      };
      const formattedDate = moment(input.date, 'DD-MM-YYYY')
        .startOf('day')
        .toDate();
      const updatedAttendance = { ...input, _id: 'someId' };

      mockAttendanceModel.findOneAndUpdate.mockResolvedValue(updatedAttendance);

      const result = await service.updateStudentAttendance(input);
      expect(result).toEqual(updatedAttendance);
    });

    test('should not update attendance if  not found', async () => {
      const input: createAttendanceDto = {
        rollNumber: '12345',
        date: '01-01-2024',
        isAbsent: 'present',
      };

      mockAttendanceModel.findOneAndUpdate.mockResolvedValue(null);

      await expect(service.updateStudentAttendance(input)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteStudentAttendance', () => {

    test('should delete attendance for a student', async () => {
      const input: deleteAttendanceDto = {
        rollNumber: '12345',
        date: '01-01-2024',
      };
      const formattedDate = moment(input.date, 'DD-MM-YYYY')
        .startOf('day')
        .toDate();
      const deletedRecord = { rollNumber: '12345', date: formattedDate };

      mockAttendanceModel.findOneAndDelete.mockResolvedValue(deletedRecord);

      const result = await service.deleteStudentAttendance(input);
      expect(result).toEqual(deletedRecord);
    });

    test('should not delete attendance if is not found', async () => {
      const input: deleteAttendanceDto = {
        rollNumber: '12345',
        date: '01-01-2024',
      };

      mockAttendanceModel.findOneAndDelete.mockResolvedValue(null);

      await expect(service.deleteStudentAttendance(input)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
