const { calculateTaskScore, sortTasksByImportance, getTopPriorityTasks } = require('../task_priority');
const { TaskPriority, TaskStatus } = require('../models');

// Basic test for calculateTaskScore - Exercise 2.1
describe('calculateTaskScore', () => {
  
  // Test 1: Basic priority score calculation
  test('should calculate score based on priority', () => {
    const lowPriorityTask = {
      priority: TaskPriority.LOW,
      dueDate: null,
      status: TaskStatus.TODO,
      tags: [],
      updatedAt: new Date()
    };
    
    const mediumPriorityTask = {
      ...lowPriorityTask,
      priority: TaskPriority.MEDIUM
    };
    
    const highPriorityTask = {
      ...lowPriorityTask,
      priority: TaskPriority.HIGH
    };
    
    const urgentPriorityTask = {
      ...lowPriorityTask,
      priority: TaskPriority.URGENT
    };
    
    const lowScore = calculateTaskScore(lowPriorityTask);
    const mediumScore = calculateTaskScore(mediumPriorityTask);
    const highScore = calculateTaskScore(highPriorityTask);
    const urgentScore = calculateTaskScore(urgentPriorityTask);
    
    expect(lowScore).toBe(10);
    expect(mediumScore).toBe(20);
    expect(highScore).toBe(30);
    expect(urgentScore).toBe(40);
  });
  
  // Test 2: Due date calculations - Exercise 2.2
  test('should add score for due date proximity', () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const taskDueToday = {
      priority: TaskPriority.MEDIUM,
      dueDate: now,
      status: TaskStatus.TODO,
      tags: [],
      updatedAt: now
    };
    
    const taskDueTomorrow = {
      ...taskDueToday,
      dueDate: tomorrow
    };
    
    const taskDueNextWeek = {
      ...taskDueToday,
      dueDate: nextWeek
    };
    
    const todayScore = calculateTaskScore(taskDueToday);
    const tomorrowScore = calculateTaskScore(taskDueTomorrow);
    const nextWeekScore = calculateTaskScore(taskDueNextWeek);
    
    // Base score (20) + due date bonus
    expect(todayScore).toBe(40); // 20 + 20
    expect(tomorrowScore).toBe(35); // 20 + 15
    expect(nextWeekScore).toBe(30); // 20 + 10
  });
  
  // Test 3: Overdue tasks
  test('should add extra score for overdue tasks', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const overdueTask = {
      priority: TaskPriority.MEDIUM,
      dueDate: yesterday,
      status: TaskStatus.TODO,
      tags: [],
      updatedAt: now
    };
    
    const overdueScore = calculateTaskScore(overdueTask);
    
    // Base score (20) + overdue bonus (30)
    expect(overdueScore).toBe(50);
  });
  
  // Test 4: Status modifiers
  test('should reduce score for completed tasks', () => {
    const now = new Date();
    
    const todoTask = {
      priority: TaskPriority.MEDIUM,
      dueDate: null,
      status: TaskStatus.TODO,
      tags: [],
      updatedAt: now
    };
    
    const doneTask = {
      ...todoTask,
      status: TaskStatus.DONE
    };
    
    const reviewTask = {
      ...todoTask,
      status: TaskStatus.REVIEW
    };
    
    const todoScore = calculateTaskScore(todoTask);
    const doneScore = calculateTaskScore(doneTask);
    const reviewScore = calculateTaskScore(reviewTask);
    
    expect(todoScore).toBe(20);
    expect(doneScore).toBe(-30); // 20 - 50
    expect(reviewScore).toBe(5); // 20 - 15
  });
  
  // Test 5: Tag boosts
  test('should boost score for blocker/critical/urgent tags', () => {
    const now = new Date();
    
    const regularTask = {
      priority: TaskPriority.MEDIUM,
      dueDate: null,
      status: TaskStatus.TODO,
      tags: ['work'],
      updatedAt: now
    };
    
    const blockerTask = {
      ...regularTask,
      tags: ['blocker']
    };
    
    const criticalTask = {
      ...regularTask,
      tags: ['critical']
    };
    
    const urgentTask = {
      ...regularTask,
      tags: ['urgent']
    };
    
    const regularScore = calculateTaskScore(regularTask);
    const blockerScore = calculateTaskScore(blockerTask);
    const criticalScore = calculateTaskScore(criticalTask);
    const urgentScore = calculateTaskScore(urgentTask);
    
    expect(regularScore).toBe(20);
    expect(blockerScore).toBe(28); // 20 + 8
    expect(criticalScore).toBe(28); // 20 + 8
    expect(urgentScore).toBe(28); // 20 + 8
  });
  
  // Test 6: Unknown priority
  test('should handle unknown priority', () => {
    const now = new Date();
    
    const unknownPriorityTask = {
      priority: 'UNKNOWN',
      dueDate: null,
      status: TaskStatus.TODO,
      tags: [],
      updatedAt: now
    };
    
    const score = calculateTaskScore(unknownPriorityTask);
    
    expect(score).toBe(0);
  });
  
  // Test 7: No due date
  test('should handle task without due date', () => {
    const now = new Date();
    
    const noDueDateTask = {
      priority: TaskPriority.HIGH,
      dueDate: null,
      status: TaskStatus.TODO,
      tags: [],
      updatedAt: now
    };
    
    const score = calculateTaskScore(noDueDateTask);
    
    expect(score).toBe(30); // Just priority score
  });
});
