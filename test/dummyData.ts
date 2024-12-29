/* eslint-disable prettier/prettier */
import * as jwt from 'jsonwebtoken';
import { User } from '../src/users/users.schema';
import { Batch } from '../src/batch/batch.schema';
import * as mongoose from 'mongoose';
import { Student } from './../src/student/student.schema';
import { Attendance } from './../src/attendance/attendance.schema';
import { ISABSENT } from '../src/enums/attendance.enum';
import { DEPARTMENT } from "../src/enums/department.enum"

const SECRET_KEY:string = process.env.SECRET_KEY || 'testsecretkey';

export const adminData = {
  _id: new mongoose.Types.ObjectId(),
  name: 'mayank',
  mobileNumber: 1234567890,
  role: 'admin',
  password: 'mayank123',
  tokens: [],
};

export const createAdmin = (): Partial<User> => {
  const token:string = jwt.sign({ _id: adminData._id }, SECRET_KEY);
  console.log(token)
  adminData.tokens = [{ token }];
  return {
    name: adminData.name,
    mobileNumber: adminData.mobileNumber,
    role: adminData.role,
    password: adminData.password,
    tokens: adminData.tokens,
  };
};

export const batchDataOne = {
  _id: new mongoose.Types.ObjectId(),
  year: 2020,
  branches: [
    {
      name: 'CE',
      totalStudentsIntake: 4,
      currentSeatCount: 0,
    },
  ],
};

export const batchDataTwo = {
  _id: new mongoose.Types.ObjectId(),
  year: 2024,
  branches: [
    {
      name: 'CE',
      totalStudentsIntake: 4,
      currentSeatCount: 0,
    },
  ],
};

export const createFirstBatch = (): Partial<Batch> => {
  return {
    year: batchDataOne.year,
    branches: batchDataOne.branches,
  };
};

export const createSecondBatch = (): Partial<Batch> => {
  return {
    year: batchDataTwo.year,
    branches: batchDataTwo.branches,
  };
};

export const studentData = {
  _id: new mongoose.Types.ObjectId(),
  name: 'student',
  rollNumber: '21ce056',
  mobileNumber: 1010101010,
  department: DEPARTMENT.CE,
  batch: 2020,
  currentSemester: 1,
  role: 'student',
};

export const createFirstStudent = (): Partial<Student> => {
  return {
    name: studentData.name,
    rollNumber: studentData.rollNumber,
    mobileNumber: studentData.mobileNumber,
    department: studentData.department,
    batch: studentData.batch,
    currentSemester: studentData.currentSemester,
    role: 'student',
  };
};

export const studentDataTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: 'student',
  rollNumber: '21ce060',
  mobileNumber: 1234567891,
  department: DEPARTMENT.CE,
  batch: 2020,
  currentSemester: 1,
  role: 'student',
};

export const createSecondStudent = (): Partial<Student> => {
  return {
    name: studentDataTwo.name,
    rollNumber: studentDataTwo.rollNumber,
    mobileNumber: studentDataTwo.mobileNumber,
    department: studentDataTwo.department,
    batch: studentDataTwo.batch,
    currentSemester: studentDataTwo.currentSemester,
    role: 'student',
  };
};

export const attendanceData = {
  _id: new mongoose.Types.ObjectId(),
  rollNumber: '21ce056',
  isAbsent:ISABSENT.ABSENT,
  date:new Date('2024-09-13T18:30:00.000Z')
};

export const createAttendance = (): Partial<Attendance> => {
  return {
      rollNumber: studentDataTwo.rollNumber,
      isAbsent:attendanceData.isAbsent,
      date:attendanceData.date
  };
};