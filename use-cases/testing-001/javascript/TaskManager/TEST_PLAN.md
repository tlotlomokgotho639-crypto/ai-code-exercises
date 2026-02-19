# Test Plan for Task Priority Functions

## Part 1: Understanding What to Test

### Exercise 1.1: Behavior Analysis - calculateTaskScore

Based on analysis of the calculateTaskScore function, here are the key behaviors to test:

**1. Priority Score Calculation**
- LOW priority should give score of 10 (1 × 10)
- MEDIUM priority should give score of 20 (2 × 10)
- HIGH priority should give score of 30 (3 × 10)
- URGENT priority should give score of 40 (4 × 10)
- Unknown priority should give score of 0

**2. Due Date Factor**
- Overdue tasks (past due date): +30 points
- Due today: +20 points
- Due within 2 days: +15 points
- Due within 7 days: +10 points
- No due date: no additional points

**3. Status Modifiers**
- DONE status: -50 points
- REVIEW status: -15 points
- TODO/IN_PROGRESS: no modification

**4. Tag Boost**
- Tasks with "blocker", "critical", or "urgent" tags: +8 points

**5. Recency Boost**
- Tasks updated within 1 day: +5 points

### Test Cases Identified (Minimum 5):

1. **Basic Priority Test**: Test that each priority level gives correct base score
2. **Due Date - Overdue**: Test that overdue tasks get +30 points
3. **Due Date - Today**: Test that tasks due today get +20 points
4. **Status - DONE**: Test that completed tasks get -50 points
5. **Tags Boost**: Test that blocker/critical/urgent tags give +8 points
6. **Edge Case - No dueDate**: Test task without dueDate doesn't crash
7. **Edge Case - Unknown priority**: Test task with invalid priority returns 0
8. **Recency**: Test that recently updated tasks get +5 points

---

## Part 1.2: Test Planning for All Three Functions

### Functions to Test:
1. calculateTaskScore(task)
2. sortTasksByImportance(tasks)
3. getTopPriorityTasks(tasks, limit)

### Priority of Test Cases:

**High Priority:**
- calculateTaskScore with various priorities
- calculateTaskScore with different due dates
- sortTasksByImportance returns sorted array
- getTopPriorityTasks returns correct limit

**Medium Priority:**
- calculateTaskScore with status modifiers
- calculateTaskScore with tags
- calculateTaskScore with recency
- Integration: all three functions work together

**Lower Priority:**
- Edge cases (null inputs, empty arrays)
- Boundary conditions (limit=0, limit=undefined)

### Types of Tests Needed:
- **Unit Tests**: Test each function individually
- **Integration Tests**: Test the workflow of all three functions together

### Test Dependencies:
- calculateTaskScore must work first (other functions depend on it)
- sortTasksByImportance depends on calculateTaskScore
- getTopPriorityTasks depends on sortTasksByImportance

### Expected Outcomes:
- calculateTaskScore returns numeric score
- sortTasksByImportance returns array sorted by score (descending)
- getTopPriorityTasks returns array with maximum of 'limit' items

---

## Test Cases Checklist:

### calculateTaskScore Tests:
- [ ] Test LOW priority = 10
- [ ] Test MEDIUM priority = 20
- [ ] Test HIGH priority = 30
- [ ] Test URGENT priority = 40
- [ ] Test unknown priority = 0
- [ ] Test overdue dueDate +30
- [ ] Test due today +20
- [ ] Test due within 2 days +15
- [ ] Test due within 7 days +10
- [ ] Test no dueDate (no additional points)
- [ ] Test DONE status -50
- [ ] Test REVIEW status -15
- [ ] Test blocker tag +8
- [ ] Test critical tag +8
- [ ] Test urgent tag +8
- [ ] Test no tags (no boost)
- [ ] Test updated within 1 day +5
- [ ] Test null task (should handle gracefully)
- [ ] Test task with missing properties

### sortTasksByImportance Tests:
- [ ] Test returns array sorted by score (descending)
- [ ] Test doesn't modify original array
- [ ] Test empty array returns empty
- [ ] Test single item array returns single item

### getTopPriorityTasks Tests:
- [ ] Test returns correct number of items based on limit
- [ ] Test default limit of 5
- [ ] Test empty array returns empty
- [ ] Test returns all items if fewer than limit
