/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from '../attendance.controller';
import { AttendanceService } from '../attendance.service';
import {
  createAttendanceDto,
  getAttendanceDto,
  deleteAttendanceDto,
  attendanceAnalyticsDto,
} from '../input/attendance.dto';

const mockAttendanceService = {
  addAttendance: jest.fn(),
  getStudentAttendance: jest.fn(),
  updateStudentAttendance: jest.fn(),
  deleteStudentAttendance: jest.fn(),
  getLowAttendanceAnalytics: jest.fn(),
};

describe('AttendanceController', () => {
  let controller: AttendanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        { provide: AttendanceService, useValue: mockAttendanceService },
      ],
    }).compile();

    controller = module.get<AttendanceController>(AttendanceController);
  });

  describe('addAttendance', () => {
    it('should add attendance for a student', async () => {
      const input: createAttendanceDto = {
        rollNumber: '12345',
        date: '01-01-2024',
        isAbsent: 'absent',
      };

      mockAttendanceService.addAttendance.mockResolvedValue(input);

      const result = await controller.addAttendance(input);
      expect(result).toEqual(input);
    });
  });

  describe('getAttendance', () => {
    it('should get attendance for a specific date', async () => {
      const query: getAttendanceDto = { date: '01-01-2024' };
      const expectedResult = [
        { rollNumber: '12345', date: query.date, isAbsent: 'absent' },
      ];

      mockAttendanceService.getStudentAttendance.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getAttendance(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateAttendance', () => {
    it('should update attendance for a student', async () => {
      const input: createAttendanceDto = {
        rollNumber: '12345',
        date: '01-01-2024',
        isAbsent: 'present',
      };

      mockAttendanceService.updateStudentAttendance.mockResolvedValue(input);

      const result = await controller.updateAttendance(input);
      expect(result).toEqual(input);
    });
  });

  describe('deleteAttendance', () => {
    it('should delete attendance of student by roll number and date', async () => {
      const query: deleteAttendanceDto = {
        rollNumber: '12345',
        date: '01-01-2024',
      };

      mockAttendanceService.deleteStudentAttendance.mockResolvedValue({
        message: 'Attendance deleted successfully',
      });

      const result = await controller.deleteAttendance(query);
      expect(result).toEqual({ message: 'Attendance deleted successfully' });
    });
  });

  describe('getLowAttendance', () => {
    it('should get attendance analytics for students with less than 75% attendance', async () => {
      const query: attendanceAnalyticsDto = {
        startDate: '01-01-2024',
        endDate: '31-12-2024',
      };

      const expectedResult = [{ rollNumber: '12345', percentage: 70 }];

      mockAttendanceService.getLowAttendanceAnalytics.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getLowAttendance(query);
      expect(result).toEqual(expectedResult);
    });
  });
});
