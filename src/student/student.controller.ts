/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { createStudentDto } from './input/create-student.dto';
import { updateStudentDto } from './input/update-student.dto';
import { StudentService } from './student.service';

@Controller('student')
export class StudentController {
  constructor(
    private readonly studentService: StudentService
  ) {}

  /**
   * create a student
   * @param {createStudentDto} input
   * @return {*}
   * @memberof StudentController
   */
  @Post('create')
  async createStudent(@Body() input: createStudentDto) {
    return await this.studentService.createNewStudent(input);
  }

  
  /**
   * list of all student
   * @return {*}
   * @memberof StudentController
   */
  @Get('all')
  async getStudents() {
    return await this.studentService.getStudentByDetails({});
  }

  /**
   * delete student
   * @param rollNumber 
   * @returns 
   * @memberof StudentController
   */
  @Delete('delete')
  async deleteStudent(@Query('rollNumber') rollNumber: string) {
    return await this.studentService.deleteStudent(rollNumber);
  }

  /**
   * update student
   * @param rollNumber 
   * @param input 
   * @returns 
   * @memberof StudentController
   */
  @Patch('update')
  async updateStudent(
    @Query('rollNumber') rollNumber: string,
    @Body() input: updateStudentDto,
  ) {
    console.log(input);
    return await this.studentService.updateStudent(rollNumber, input);
  }

   /**
   * student analytics
   * @return {*}
   * @memberof StudentController
   */
  @Get('analytics')
  async getStudentAnalytics() {
    return await this.studentService.getStudentAnalyticsData();
  }
  
  /**
   * get student by Roll number
   * @param rollNumber 
   * @returns
   * @memberof StudentController 
   */
  @Get(':rollNumber')
  async getStudent(@Param('rollNumber') rollNumber: string) {
    const student = await this.studentService.getStudentByDetails({
      rollNumber,
    });
    return student[0];
  }
}
