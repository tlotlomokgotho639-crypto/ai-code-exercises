const { calculateTaskScore, sortTasksByImportance, getTopPriorityTasks } = require('../task_priority');
const { TaskPriority, TaskStatus } = require('../models');

// Integration Test - Part 4: Testing the Full Workflow
describe('Task Priority Integration Tests', () => {
  
  // Test data for integration testing
  const createTask = (overrides = {}) => ({
    id: 1,
    name: 'Test Task',
    priority: TaskPriority.MEDIUM,
    dueDate: null,
    status: TaskStatus.TODO,
    tags: [],
    updatedAt: new Date(),
    ...overrides
  });
  
  describe('Full Workflow: calculateTaskScore, sortTasksByImportance, getTopPriorityTasks', () => {
    
    test('should sort tasks by importance and return top priorities', () => {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const tasks = [
        createTask({ 
          name: 'Low Priority Task', 
          priority: TaskPriority.LOW,
          dueDate: nextWeek,
          status: TaskStatus.TODO 
        }),
        createTask({ 
          name: 'High Priority Task', 
          priority: TaskPriority.HIGH,
          dueDate: tomorrow,
          status: TaskStatus.TODO 
        }),
        createTask({ 
          name: 'Urgent Task', 
          priority: TaskPriority.URGENT,
          dueDate: now, // due today
          status: TaskStatus.TODO 
        }),
        createTask({ 
          name: 'Completed Task', 
          priority: TaskPriority.URGENT,
          dueDate: now,
          status: TaskStatus.DONE 
        }),
        createTask({ 
          name: 'Medium Priority Task', 
          priority: TaskPriority.MEDIUM,
          dueDate: nextWeek,
          status: TaskStatus.TODO,
          tags: ['blocker'] 
        }),
      ];
      
      // Test getTopPriorityTasks returns correct number of items
      const topTasks = getTopPriorityTasks(tasks, 3);
      expect(topTasks).toHaveLength(3);
      
      // Verify they are sorted by score (descending)
      const scores = topTasks.map(t => calculateTaskScore(t));
      expect(scores[0]).toBeGreaterThanOrEqual(scores[1]);
      expect(scores[1]).toBeGreaterThanOrEqual(scores[2]);
      
      // Verify the highest scoring task is the urgent task due today
      expect(topTasks[0].name).toBe('Urgent Task');
    });
    
    test('should return all tasks if limit exceeds array length', () => {
      const tasks = [
        createTask({ name: 'Task 1', priority: TaskPriority.LOW }),
        createTask({ name: 'Task 2', priority: TaskPriority.MEDIUM }),
      ];
      
      const topTasks = getTopPriorityTasks(tasks, 10);
      expect(topTasks).toHaveLength(2);
    });
    
    test('should return empty array for empty input', () => {
      const sorted = sortTasksByImportance([]);
      expect(sorted).toEqual([]);
      
      const topTasks = getTopPriorityTasks([]);
      expect(topTasks).toEqual([]);
    });
    
    test('sortTasksByImportance should not modify original array', () => {
      const originalTasks = [
        createTask({ name: 'Task 1', priority: TaskPriority.LOW }),
        createTask({ name: 'Task 2', priority: TaskPriority.HIGH }),
      ];
      
      const originalLength = originalTasks.length;
      const sorted = sortTasksByImportance(originalTasks);
      
      expect(originalTasks).toHaveLength(originalLength);
      expect(originalTasks[0].name).toBe('Task 1'); // Original unchanged
      expect(sorted[0].name).toBe('Task 2'); // Highest priority first
    });
    
    test('should handle tasks with various combinations of factors', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const tasks = [
        // High priority + overdue + blocker tag = should be very high score
        createTask({
          name: 'Critical Overdue',
          priority: TaskPriority.HIGH,
          dueDate: yesterday,
          status: TaskStatus.TODO,
          tags: ['blocker'],
          updatedAt: now
        }),
        // Low priority + done = low score
        createTask({
          name: 'Completed Low',
          priority: TaskPriority.LOW,
          dueDate: null,
          status: TaskStatus.DONE,
          tags: [],
          updatedAt: now
        }),
        // Medium priority + due today + critical tag
        createTask({
          name: 'Medium Due Today',
          priority: TaskPriority.MEDIUM,
          dueDate: now,
          status: TaskStatus.TODO,
          tags: ['critical'],
          updatedAt: now
        }),
      ];
      
      const sorted = sortTasksByImportance(tasks);
      
      // First should be Critical Overdue (HIGH*10 + 30 + 8 = 68)
      expect(sorted[0].name).toBe('Critical Overdue');
      
      // Second should be Medium Due Today (20 + 20 + 8 = 48)
      expect(sorted[1].name).toBe('Medium Due Today');
      
      // Third should be Completed Low (10 - 50 = -40)
      expect(sorted[2].name).toBe('Completed Low');
    });
    
    test('getTopPriorityTasks should use default limit of 5', () => {
      const tasks = Array(10).fill(null).map((_, i) => 
        createTask({ name: `Task ${i}`, priority: TaskPriority.LOW })
      );
      
      const topTasks = getTopPriorityTasks(tasks);
      expect(topTasks).toHaveLength(5);
    });
  });
});
