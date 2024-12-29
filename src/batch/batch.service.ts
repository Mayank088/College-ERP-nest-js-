/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Batch } from './batch.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createBatchDto } from './input/create-batch.dto';

@Injectable()
export class BatchService {
  constructor(@InjectModel(Batch.name) private batchModel: Model<Batch>) {}

  /**
   * Create new Batch
   * @param {createBatchDto} input
   * @return batch
   * @memberof BatchService
   */
  async createNewBatch(input: createBatchDto) {
    try {
      const batch = await this.batchModel.create(input);
      if (!batch) {
        throw new BadRequestException('Can not create Batch Try Later');
      }
      return batch;
    } catch (e) {
      return { message: e.message };
    }
  }

  /**
   * Add new Branch
   * @param {*} { year, name, totalStudentsIntake, currentSeatCount }
   * @return added branch
   * @memberof BatchService
   */
  async addNewBranch({ year, name, totalStudentsIntake, currentSeatCount }) {
    try {
      if (!year) {
        return {
          message: 'Year is required',
        };
      }
      const batch = await this.batchModel.findOne({ year });
      if (!batch) {
        return { message: 'Batch not found for the given year' };
      }
      const branchExists = batch.branches.some(
        (branch) => branch.name === name,
      );
      if (branchExists) {
        return { message: 'Branch already exists in the batch' };
      }
      batch.branches.push({
        name,
        totalStudentsIntake,
        currentSeatCount,
      });
      await batch.save();
      return batch;
    } catch (e) {
      return e;
    }
  }

  /**
   * Delete batch
   * @param {number} year
   * @return {*}
   * @memberof BatchService
   */
  async deleteBatch(year: number) {
    try {
      const deletedBatch = await this.batchModel.findOneAndDelete({ year });
      if (!deletedBatch) {
        throw new NotFoundException('No batch exists to delete');
      }
      return deletedBatch;
    } catch (error) {
      return error;
    }
  }
  
  /**
   * Get batch
   * @param {*} { year, ...input }
   * @return {*}
   * @memberof BatchService
   */
  async getBatches() {
    try {
      const batches = await this.batchModel.find({});
      if (!batches) {
        throw new NotFoundException('Not batches Exists');
      }
      return batches;
    } catch (error) {
      return error;
    }
  }

  /**
   * Update batch
   * @param {*} { year, ...input }
   * @return {*}
   * @memberof BatchService
   */
  async updateBatch({ year, ...input }) {
    try {
      if (!input.branchName) {
        return { message: 'BranchName is required' };
      }
      const batch = await this.batchModel.findOne({ year });
      if (!batch) {
        return { message: 'Batch not found for the given year' };
      }

      const branch = batch.branches.find(
        (branch) => branch.name === input.branchName,
      );
      if (!branch) {
        return { message: 'Branch not found in the batch' };
      }

      if (input.newBranchName) {
        branch.name = input.newBranchName;
      }
      if (input.totalStudentsIntake) {
        branch.totalStudentsIntake = input.totalStudentsIntake;
      }
      if (input.currentSeatCount) {
        branch.currentSeatCount = input.currentSeatCount;
      }
      await batch.save();
      return batch;
    } catch (error) {
      return error;
    }
  }

  /**
   * check for seat available or not
   * @param {string} department
   * @param {number} batch
   * @return {*}  {Promise<boolean>}
   * @memberof BatchHelper
   */
  async checkSeat(department: string, batch: number): Promise<boolean> {
    const foundBatch = await this.batchModel.findOne({ year: batch });

    if (!foundBatch) {
      throw new NotFoundException('Batch not found for the given year');
    }

    const branch = foundBatch.branches.find(
      (branch) => branch.name === department,
    );

    if (!branch) {
      throw new NotFoundException('Branch not found in the batch');
    }

    return branch.totalStudentsIntake > branch.currentSeatCount;
  }
  
  /**
   * update Seat when a student is created or deleted
   * @param {*} { department, batch, count }
   * @return {*}
   * @memberof BatchHelper
   */
  async updateSeatCount({ department, batch, count }) {
    return await this.batchModel.findOneAndUpdate(
      { year: batch, 'branches.name': department },
      {
        $inc: {
          'branches.$.currentSeatCount': count,
          totalEnrolledStudents: count,
        },
      },
      { new: true },
    );
  }
  
  /**
   * Get Vacant Seats
   * @param {number} year
   * @return {*}
   * @memberof BatchHelper
   */
  async getVacantSeatsByYear(year: number) {
    const vacantSeats = await this.batchModel.aggregate([
      {
        $match: {
          year,
        },
      },
      {
        $project: {
          _id: 0,
          batch: '$year',
          totalStudents: '$totalEnrolledStudents',
          totalStudentsIntake: {
            $sum: '$branches.totalStudentsIntake',
          },
          availableIntake: {
            $subtract: [
              {
                $sum: '$branches.totalStudentsIntake',
              },
              {
                $sum: '$branches.currentSeatCount',
              },
            ],
          },
          branches: {
            $map: {
              input: '$branches',
              as: 'branch',
              in: {
                k: '$$branch.name',
                v: {
                  totalStudents: '$$branch.currentSeatCount',
                  totalStudentsIntake: '$$branch.totalStudentsIntake',
                  availableIntake: {
                    $subtract: [
                      '$$branch.totalStudentsIntake',
                      '$$branch.currentSeatCount',
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          batch: 1,
          totalStudents: 1,
          totalStudentsIntake: 1,
          availableIntake: 1,
          branch: {
            $arrayToObject: '$branches',
          },
        },
      },
    ]);
    if (!vacantSeats.length) {
      throw new BadRequestException(
        'Not able to fetch analytics please provide or check the year',
      );
    }
    return vacantSeats;
  }
}
