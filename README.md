# ai-code-exercises

Code Exercises for AI Course for Software Engineers.

This is still a work in progress - the idea is to capture the various exercise starter code examples in here.

## Exercises

 Use Case | Exercise | Instructions | Starter Code |
| --- | --- | --- | --- |
| Code Comprehension | Code Explore Challenge | [Instructions](https://ai.wethinkco.de/ai-software/ai-use-cases/exercises/exercise-code-comprehension-001/) | [Starter Code](use-cases/code-comprehension-001/README.md) |
| Code Comprehension | Algorithm Deconstruction Challenge | [Instructions](https://ai.wethinkco.de/ai-software/ai-use-cases/exercises/exercise-code-algorithms/) | [Starter Code](use-cases/code-algorithms/README.md) |
| Code Comprehension | Knowing Where to Start | [Instructions](https://ai.wethinkco.de/ai-software/ai-use-cases/exercises/exercise-code-comprehension-002/) | [Starter Code](use-cases/code-algorithms/README.md) |
| Documenting Code | Code Documentation | [Instructions](https://ai.wethinkco.de/ai-software/ai-use-cases/exercises/exercise-doc-code/) | [Starter Code](use-cases/code-algorithms/README.md) |
| Documenting Code |README documentation | [Instructions](https://ai.wethinkco.de/ai-software/ai-use-cases/exercises/exercise-doc-readme/) | [Starter Code](use-cases/code-algorithms/README.md) |
| Debugging | Error Diagnosis Challenge | [Instructions](https://ai.wethinkco.de/ai-software/ai-use-cases/exercises/exercise-debug-errors-001/) | [Starter Code](use-cases/debug-errors-001/README.md) |
| Debugging | Performance Optimization Challenge | [Instructions](https://ai.wethinkco.de/ai-software/ai-use-cases/exercises/exercise-code-performance/) | [Starter Code](use-cases/debug-performance/README.md) |
| Debugging | AI Solution Verification Challenge | [Instructions](https://ai.wethinkco.de/ai-software/ai-use-cases/exercises/exercise-debug-limitations/) | [Starter Code](use-cases/debug-limitations/README.md) |
| Testing | Using AI to help with testing | [Instructions](https://ai.wethinkco.de/ai-software/ai-use-cases/exercises/exercise-testing-001/) | [Starter Code](use-cases/testing-001) |
| Refactoring | Function Decomposition Challenge | [Instructions](https://ai.wethinkco.de/ai-software/ai-use-cases/exercises/exercise-refactor-functions/) | [Starter Code](use-cases/refactor-functions) |

## Solutions & Improvements

This section documents all the fixes and improvements made to the exercise starter code.

### Error Fixes

| File | Issue | Solution |
|------|-------|----------|
| `use-cases/debug-errors-001/javascript/userList.js` | Index Out of Bounds - loop iterated beyond array length | Changed `for (let i = 0; i < 5; i++)` to `for (let i = 0; i < Math.min(5, users.length); i++)` |
| `use-cases/debug-errors-001/javascript/taskManager.js` | Global Variable Being Overwritten - local variable shadowed global | Changed `let tasks = {...}` to use `tasks.push(newTask)` to properly modify global array |
| `use-cases/debug-limitations/javascript/merge_sort.js` | Infinite loop bug - wrong increment variable | Changed `j++` to `i++` in merge function |

### Performance Optimization

| File | Issue | Solution |
|------|-------|----------|
| `use-cases/debug-performance/javascript/orders-service.js` | Slow database query (8-10 seconds) - correlated subqueries, no pagination | Added pagination support, rewrote query to use JOINs instead of correlated subqueries, added createIndexes() function |

### Testing

| File | Description |
|------|-------------|
| `use-cases/testing-001/javascript/TaskManager/TEST_PLAN.md` | Comprehensive test plan for calculateTaskScore, sortTasksByImportance, getTopPriorityTasks |
| `use-cases/testing-001/javascript/TaskManager/tests/calculateTaskScore.test.js` | 7 unit tests covering priority, due dates, status, tags |
| `use-cases/testing-001/javascript/TaskManager/tests/integration.test.js` | Integration tests for full workflow |

### Code Refactoring

| File | Pattern/Issue | Solution |
|------|--------------|----------|
| `use-cases/refactor-patterns/javascript/user_statistics.js` | Code duplication - repeated loops for avg/highest calculations | Created helper functions `calculateAverage()` and `findHighest()` to eliminate duplication |
| `use-cases/refactor-patterns/javascript/user_validation.js` | Nested conditionals - complex validation logic | Broke down into focused validator functions (validateUsername, validatePassword, etc.) |
| `use-cases/refactor-patterns/javascript/inventory_processor.js` | Cryptic variable names (p, i, a, q, r, t, c, f, k) | Renamed to meaningful names: processInventory, requestedItems, inventory, quantityOrdered, successfulItems, totalPrice, currentItem, isAvailable |
| `use-cases/refactor-patterns/javascript/shipping_calculator.js` | Nested conditionals for shipping methods/destinations | Implemented Strategy pattern with separate strategy classes for each shipping method |

### Key Improvements Summary

1. **Error Prevention**: Fixed index bounds, variable shadowing, and infinite loop bugs
2. **Performance**: Optimized database queries from 8-10 seconds to efficient queries with pagination
3. **Testability**: Added comprehensive test plans and unit/integration tests
4. **Maintainability**: Applied DRY principle, meaningful naming, and design patterns (Strategy)
5. **Readability**: Replaced cryptic names with descriptive identifiers, broke down complex functions
