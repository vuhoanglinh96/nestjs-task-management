import { TaskStatus } from '../task-status.enum';

export class GetTaskFilterDto {
  status?: TaskStatus;
  search?: string;
}
