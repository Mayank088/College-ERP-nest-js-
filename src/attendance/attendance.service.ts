/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Attendance } from './attendance.schema';
import { Model } from 'mongoose';
import { attendanceAnalyticsDto, createAttendanceDto, deleteAttendanceDto } from './input/attendance.dto';
import { StudentService } from '../student/student.service';
import * as moment from 'moment';
import { ISABSENT } from '../enums/attendance.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
    private readonly studentService: StudentService,
  ) {}

  /**
   * Adds attendance
   * @param {createAttendanceDto} input
   * @return attendance
   * @memberof AttendanceService
   */
  async addAttendance(input: createAttendanceDto) {
    await this.studentService.getStudent(input);

    const formattedDate = moment(input.date, 'DD-MM-YYYY')
    .startOf('day')
    .toDate();

    const existingAttendance = await this.attendanceModel.findOne({
      rollNumber: input.rollNumber,
      date: formattedDate,
    });

    if (existingAttendance) {
      throw new BadRequestException('Attendance already recorded');
    }

    const attendance = await this.attendanceModel.create({
      date: formattedDate,
      rollNumber: input.rollNumber,
      isAbsent: input.isAbsent,
    });
    
    return attendance;
  }
  
  /**
   * Get student attendance
   * @param {*} input
   * @return students
   * @memberof AttendanceService
   */
  async getStudentAttendance(input) {
    const formattedDate = moment(input, 'DD-MM-YYYY').startOf('day').toDate();
    const attendanceRecords = await this.attendanceModel
      .find({
        date: formattedDate,
        isAbsent: ISABSENT.ABSENT,
      })
      .select('rollNumber');
    if (!attendanceRecords.length) {
      throw new NotFoundException('No student found absent for this day');
    }
    const rollNumbers = attendanceRecords.map((record) => record.rollNumber);
    const students = await this.studentService.getStudent({
      rollNumber: { $in: rollNumbers },
    });
    return students;
  }

  /**
   * Updates attendance
   * @param {createAttendanceDto} input
   * @return updatedAttendance
   * @memberof AttendanceService
   */
  async updateStudentAttendance(input: createAttendanceDto) {
    const formattedDate = moment(input.date, 'DD-MM-YYYY')
      .startOf('day')
      .toDate();
    const updatedAttendance = await this.attendanceModel.findOneAndUpdate(
      {
        rollNumber: input.rollNumber, 
        date: formattedDate 
      },
      { isAbsent: input.isAbsent },
      { new: true, runValidators: true },
    );
    if (!updatedAttendance) {
      throw new NotFoundException(
        'Attendance not Updated check for attendance details ',
      );
    }
    return updatedAttendance;
  }

  /**
   *Deletes Attendance
   * @param {deleteAttendanceDto} input
   * @return deletedRecord
   * @memberof AttendanceService
   */
  async deleteStudentAttendance(input: deleteAttendanceDto) {
    const deletedRecord = await this.attendanceModel.findOneAndDelete({
      rollNumber: input.rollNumber,
    });
    if (!deletedRecord) {
      throw new NotFoundException(
        'Attendance not deleted please check for attendance details',
      );
    }
    return deletedRecord;
  }

  /**
   * Low Attendance Analytics
   * @param {attendanceAnalyticsDto} input : startDate,endDate
   * @return analytics
   * @memberof AttendanceHelper
   */
  async getLowAttendanceAnalytics(input: attendanceAnalyticsDto) {
    const { startDate, endDate } = input;

    const formattedStartDate = moment(startDate, 'DD-MM-YYYY')
      .startOf('day')
      .toDate();

    const formattedEndDate = moment(endDate, 'DD-MM-YYYY')
      .endOf('day')
      .toDate();

    const aggregateQuery = [
      {
        $match: {
          date: { $gte: formattedStartDate, $lte: formattedEndDate },
        },
      },
      {
        $group: {
          _id: '$rollNumber',
          totalDays: { $sum: 1 },
          absentDays: {
            $sum: {
              $cond: [{ $eq: ['$isAbsent', ISABSENT.PRESENT] }, 1, 0],
            },
          },
        },
      },
      {
        $addFields: {
          attendancePercentage: {
            $divide: [
              {
                $multiply: [100, '$absentDays'],
              },
              '$totalDays',
            ],
          },
        },
      },
      {
        $match: {
          attendancePercentage: { $lt: 75 },
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: 'rollNumber',
          as: 'studentDetails',
        },
      },
      {
        $unwind: '$studentDetails',
      },
      {
        $project: {
          _id: 0,
          attendancePercentage: 1,
          studentDetails: 1,
        },
      },
    ];
    const analytics = await this.attendanceModel.aggregate(aggregateQuery);

    if (!analytics.length) {
      throw new BadRequestException(
        'Error while fetching details Please check for details',
      );
    }
    return analytics;
  }
}
