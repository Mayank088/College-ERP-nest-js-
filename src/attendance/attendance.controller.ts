/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { attendanceAnalyticsDto, createAttendanceDto, deleteAttendanceDto, getAttendanceDto } from './input/attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * create attendance
   * @param {createAttendanceDto} input
   * @return {*}
   * @memberof AttendanceController
  */
  @Post('create')
  async addAttendance(@Body() input: createAttendanceDto) {
    return this.attendanceService.addAttendance(input);
  }

  /**
   * Get attendance list 
   * @param {getAttendanceDto} query
   * @return {*}
   * @memberof AttendanceController
   */
  @Get()
  async getAttendance(@Query() query: getAttendanceDto) {
    return await this.attendanceService.getStudentAttendance(query.date);
  }

  /**
   * Update attendance
   * @param {createAttendanceDto} input
   * @return {*}
   * @memberof AttendanceController
   */
  @Patch('update')
  async updateAttendance(@Body() input: createAttendanceDto) {
    return await this.attendanceService.updateStudentAttendance(input);
  }

  /**
   * delete attendance by rollNumber 
   * @param {deleteAttendanceDto} query
   * @return {*}
   * @memberof AttendanceController
   */
  @Delete('delete')
  async deleteAttendance(@Query() query: deleteAttendanceDto) {
    return await this.attendanceService.deleteStudentAttendance(query);
  }
  
  /**
   * get attendance analytics less then 75%
   * @param {attendanceAnalyticsDto} query
   * @return {*}
   * @memberof AttendanceController
   */
  @Get('analytics')
  async getLowAttendance(@Query() query: attendanceAnalyticsDto) {
    return await this.attendanceService.getLowAttendanceAnalytics(query);
  }
}
