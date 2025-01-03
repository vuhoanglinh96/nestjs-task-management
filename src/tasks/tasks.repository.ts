import { DataSource, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { User } from '../auth/user.entity';

@Injectable()
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepository', {timestamp: true});
  constructor(private dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  async getAllTasks(filterDto: GetTaskFilterDto, user: User): Promise<Task[]> {

    const { status, search } = filterDto;
    const query = this.createQueryBuilder('task');

    query.where({user})

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE :search)',
        { search: `%${search}%` },
      );
    }
    console.log(query.getQueryAndParameters());

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(`Failed to get tasks for user "${user.username}". Filters: ${JSON.stringify(filterDto)}`, error.stack);
      throw new InternalServerErrorException();
    }
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });
    await this.save(task);
    return task;
  }
}
