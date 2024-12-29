/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { createBatchDto, createBranchDto } from './input/create-batch.dto';
import { updateBranchDto } from './input/update-batch.dto';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../customDecorator/roles.decorator';
import { USER_ROLE } from '../enums/roles.enum';
import { BatchService } from './batch.service';

@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  
  /**
   * create a new batch
   * @param {createBatchDto} input
   * @return {*}
   * @memberof BatchController
   */
  @Post('create')
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RolesGuard)
  async createBatch(@Body() input: createBatchDto) {
    return await this.batchService.createNewBatch(input);
  }
  
  /**
   * Add a new branch.
   * @param {number} year
   * @param {createBranchDto} input
   * @return {*}
   * @memberof BatchController
   */
  @Post('branch')
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RolesGuard)
  async addBranch(
    @Query('year', ParseIntPipe) year: number,
    @Body() input: createBranchDto,
  ) {
    return await this.batchService.addNewBranch({ year, ...input });
  }

  /**
   * get Batches
   * @return {*}
   * @memberof BatchController
   */
  @Get()
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RolesGuard)
  async getBatch() {
    return await this.batchService.getBatches();
  }

  /**
   * delete a Batch
   * @param {number} year
   * @return {*}
   * @memberof BatchController
   */
  @Delete('delete')
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RolesGuard)
  async deleteBatch(@Query('year', ParseIntPipe) year: number) {
    return await this.batchService.deleteBatch(year);
  }

  /**
   * update a Batch
   * @param {number} year
   * @param {updateBranchDto} input
   * @return {*}
   * @memberof BatchController
   */
  @Patch('update')
  async updateBatch(
    @Query('year', ParseIntPipe) year: number,
    @Body() input: updateBranchDto,
  ) {
    return await this.batchService.updateBatch({ year, ...input });
  }

  /**
   * Batch analytics
   * @param {number} year
   * @return {*}
   * @memberof BatchController
   */
  @Get('analytics')
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RolesGuard)
  async getVacantSeatAnalytics(@Query('year', ParseIntPipe) year: number) {
    return await this.batchService.getVacantSeatsByYear(year);
  }
}
