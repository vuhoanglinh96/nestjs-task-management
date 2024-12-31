import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskRepository } from './tasks.repository';
import { User } from '../auth/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { TaskStatus } from './task-status.enum';

const mockTaskRepository = () => ({
  getAllTasks: jest.fn(),
  createTask: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockUser: User = {
  id: 'userId',
  username: 'testUser',
  password: 'testPassword',
  task: []
};

describe('TasksService', () => {
  let tasksService: TasksService;
  let taskRepository: TaskRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    taskRepository = module.get<TaskRepository>(TaskRepository);
  });

  describe('getAllTasks', () => {
    it('gets all tasks from the repository', async () => {
      (taskRepository.getAllTasks as jest.Mock).mockResolvedValue('someTasks');
      expect(taskRepository.getAllTasks).not.toHaveBeenCalled();

      const filterDto: GetTaskFilterDto = { status: TaskStatus.OPEN, search: 'test' };
      const result = await tasksService.getAllTasks(filterDto, mockUser);
      expect(taskRepository.getAllTasks).toHaveBeenCalledWith(filterDto, mockUser);
      expect(result).toEqual('someTasks');
    });
  });

  describe('createTask', () => {
    it('creates a task and returns it', async () => {
      const createTaskDto: CreateTaskDto = { title: 'Test task', description: 'Test desc' };
      (taskRepository.createTask as jest.Mock).mockResolvedValue('someTask');
      expect(taskRepository.createTask).not.toHaveBeenCalled();

      const result = await tasksService.createTask(createTaskDto, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalledWith(createTaskDto, mockUser);
      expect(result).toEqual('someTask');
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and successfully retrieves and returns the task', async () => {
      const mockTask = { title: 'Test task', description: 'Test desc' };
      (taskRepository.findOne as jest.Mock).mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById('testId', mockUser);
      expect(result).toEqual(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({ where: { id: 'testId', user: mockUser } });
    });

    it('throws an error as task is not found', async () => {
      (taskRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(tasksService.getTaskById('testId', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTaskById', () => {
    it('updates a task and returns the updated task', async () => {
      const mockTask = { title: 'Test task', description: 'Test desc', status: 'OPEN' };
      tasksService.getTaskById = jest.fn().mockResolvedValue(mockTask);
      const updateTaskDto: UpdateTaskDto = { title: 'Updated title', description: 'Updated desc', status: TaskStatus.DONE };

      const result = await tasksService.updateTaskById('testId', updateTaskDto, mockUser);
      expect(tasksService.getTaskById).toHaveBeenCalledWith('testId', mockUser);
      expect(taskRepository.save).toHaveBeenCalledWith(mockTask);
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTaskById', () => {
    it('calls taskRepository.delete() to delete a task', async () => {
      (taskRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();

      await tasksService.deleteTaskById('testId', mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({ id: 'testId', user: mockUser });
    });

    it('throws an error as task could not be found', async () => {
      (taskRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });
      await expect(tasksService.deleteTaskById('testId', mockUser)).rejects.toThrow(NotFoundException);
    });
  });
});
