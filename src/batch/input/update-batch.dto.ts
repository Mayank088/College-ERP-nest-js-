import { PartialType } from '@nestjs/mapped-types';
import { createBatchDto } from './create-batch.dto';
export class updateBranchDto extends PartialType(createBatchDto) {}
