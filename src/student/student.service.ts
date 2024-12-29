/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Student } from './student.schema';
import { Model } from 'mongoose';
import { createStudentDto } from './input/create-student.dto';
import { updateStudentDto } from './input/update-student.dto';
import { BatchService } from '../batch/batch.service';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
    private readonly batchService: BatchService,
  ) {}

  /**
   * Create student object
   * @param {createStudentDto} input
   * @return 
   * @memberof StudentService
   */
  async createNewStudent(input: createStudentDto) {
    const isSeatAvailable = await this.batchService.checkSeat(
      input.department,
      input.batch,
    );
    if (!isSeatAvailable) {
      throw new BadRequestException('Seat Not available');
    }
    const student = await this.studentModel.create(input);
    await this.batchService.updateSeatCount({
      department: input.department,
      batch: input.batch,
      count: 1,
    });
    return student;
  }

  /**
   * get student by details
   * @param {createStudentDto} input
   * @return 
   * @memberof StudentService
   */
  async getStudentByDetails(input) {
    const students = await this.studentModel.find({ ...input });
    if (!students.length) {
      throw new NotFoundException('Student does not Exists');
    }
    return students;
  }

  /**
   * delete student by Roll number
   * @param rollNumber 
   * @returns 
   * @memberof StudentService
   */
  async deleteStudent(rollNumber: string) {
    const deletedStudent = await this.studentModel.findOneAndDelete({
      rollNumber,
    });
    if (!deletedStudent) {
      throw new NotFoundException(
        'Student does not exists Please recheck the rollNumber',
      );
    }
    await this.batchService.updateSeatCount({
      department: deletedStudent.department,
      batch: deletedStudent.batch,
      count: -1,
    });
    return deletedStudent;
  }

  /**
   * update student by Roll number
   * @param rollNumber 
   * @param input 
   * @returns updated student
   * @memberof StudentService
   */
  async updateStudent(rollNumber: string, input: updateStudentDto) {
    console.log(input);
    const updatedStudent = await this.studentModel.findOneAndUpdate(
      { rollNumber },
      { $set: input },
      { new: true, runValidators: true },
    );
    if (!updatedStudent) {
      throw new NotFoundException(
        'Student not updated please provide or check the rollNumber or try again',
      );
    }
    return updatedStudent;
  }
  
  /**
   * get one student
   * @param input 
   * @returns 
   * @memberof StudentService
   */
  async getStudent(input) {
    const students = await this.studentModel.findOne({
      rollNumber: input.rollNumber,
    });
    if (!students) {
      throw new NotFoundException('Student does not Exists');
    }
    return students;
  }

  /**
   * student analytics
   * @returns 
   * @memberof StudentService
   */
  async getStudentAnalyticsData() {
    const analytics = await this.studentModel.aggregate([
      {
        $group: {
          _id: {
            year: '$batch',
            branch: '$department',
          },
          totalStudents: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.year',
          totalStudents: { $sum: '$totalStudents' },
          branches: {
            $push: {
              k: '$_id.branch',
              v: '$totalStudents',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id',
          totalStudents: 1,
          branches: { $arrayToObject: '$branches' },
        },
      },
    ]);
    if (!analytics.length) {
      throw new BadRequestException(
        'Not able to fetch Student analytics currently',
      );
    }
    return analytics;
  }
}
