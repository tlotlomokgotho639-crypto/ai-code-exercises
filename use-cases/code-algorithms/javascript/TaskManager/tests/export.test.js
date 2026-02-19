// tests/export.test.js
const fs = require('fs');
const { TaskExporter } = require('../export');
const { TaskManager } = require('../app');
const { TaskPriority, TaskStatus } = require('../models');

describe('TaskExporter', () => {
  let taskExporter;
  let mockTaskManager;
  let tempFilePath;

  beforeEach(() => {
    // Create a mock TaskManager
    mockTaskManager = {
      listTasks: jest.fn()
    };
    
    taskExporter = new TaskExporter(mockTaskManager);
    
    // Create a temporary file path for testing
    tempFilePath = './test-export.csv';
  });

  afterEach(() => {
    // Clean up the temporary file after each test
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    jest.clearAllMocks();
  });

  describe('exportToCSV', () => {
    test('should export tasks to CSV successfully', () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          priority: TaskPriority.HIGH,
          status: TaskStatus.TODO,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          dueDate: new Date('2024-12-31'),
          completedAt: null,
          tags: ['tag1', 'tag2']
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Description 2',
          priority: TaskPriority.LOW,
          status: TaskStatus.DONE,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-03'),
          dueDate: null,
          completedAt: new Date('2024-01-03'),
          tags: []
        }
      ];

      mockTaskManager.listTasks.mockReturnValue(mockTasks);

      const result = taskExporter.exportToCSV(tempFilePath);

      expect(result).toBe(true);
      expect(fs.existsSync(tempFilePath)).toBe(true);
      
      const csvContent = fs.readFileSync(tempFilePath, 'utf8');
      const lines = csvContent.split('\n');
      
      expect(lines[0]).toBe('ID,Title,Description,Priority,Status,Created At,Updated At,Due Date,Completed At,Tags');
      expect(lines.length).toBe(3); // header + 2 tasks
    });

    test('should return false when no tasks to export', () => {
      mockTaskManager.listTasks.mockReturnValue([]);

      const result = taskExporter.exportToCSV(tempFilePath);

      expect(result).toBe(false);
      expect(fs.existsSync(tempFilePath)).toBe(false);
    });

    test('should apply status filter when provided', () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: '',
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.TODO,
          createdAt: new Date(),
          updatedAt: new Date(),
          dueDate: null,
          completedAt: null,
          tags: []
        }
      ];

      mockTaskManager.listTasks.mockReturnValue(mockTasks);

      taskExporter.exportToCSV(tempFilePath, TaskStatus.TODO);

      expect(mockTaskManager.listTasks).toHaveBeenCalledWith(TaskStatus.TODO, null, false);
    });

    test('should apply priority filter when provided', () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: '',
          priority: TaskPriority.URGENT,
          status: TaskStatus.TODO,
          createdAt: new Date(),
          updatedAt: new Date(),
          dueDate: null,
          completedAt: null,
          tags: []
        }
      ];

      mockTaskManager.listTasks.mockReturnValue(mockTasks);

      taskExporter.exportToCSV(tempFilePath, null, TaskPriority.URGENT);

      expect(mockTaskManager.listTasks).toHaveBeenCalledWith(null, TaskPriority.URGENT, false);
    });

    test('should apply both status and priority filters when provided', () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          priority: TaskPriority.HIGH,
          status: TaskStatus.IN_PROGRESS,
          createdAt: new Date(),
          updatedAt: new Date(),
          dueDate: new Date(),
          completedAt: null,
          tags: ['bug']
        }
      ];

      mockTaskManager.listTasks.mockReturnValue(mockTasks);

      const result = taskExporter.exportToCSV(tempFilePath, TaskStatus.IN_PROGRESS, TaskPriority.HIGH);

      expect(result).toBe(true);
      expect(mockTaskManager.listTasks).toHaveBeenCalledWith(TaskStatus.IN_PROGRESS, TaskPriority.HIGH, false);
      expect(fs.existsSync(tempFilePath)).toBe(true);
    });
  });
});
