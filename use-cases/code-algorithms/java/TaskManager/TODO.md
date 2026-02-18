# TODO: Implement Business Rule for Abandoned Tasks

- [x] Add ABANDONED to TaskStatus enum in TaskStatus.java
- [x] Add isOverdueMoreThan7Days() method to Task.java
- [ ] Add markAbandonedTasks() method to TaskManager.java and call it in getStatistics()
- [ ] Add unit tests for new logic in TaskManagerTest.java
- [ ] Run gradlew test to verify tests pass
- [ ] Run gradlew run --args="stats" to manually verify the feature
