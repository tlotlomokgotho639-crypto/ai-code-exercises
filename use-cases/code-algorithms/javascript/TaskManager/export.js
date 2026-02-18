// export.js
const fs = require('fs');
const { TaskManager } = require('./app');

class TaskExporter {
  constructor(taskManager) {
    this.taskManager = taskManager;
  }

  /**
   * Export tasks to CSV format
   * @param {string} filePath - Path to save the CSV file
   * @param {string} statusFilter - Optional status filter
   * @param {string} priorityFilter - Optional priority filter
   * @returns {boolean} - Success status
   */
  exportToCSV(filePath, statusFilter = null, priorityFilter = null) {
    try {
      const tasks = this.taskManager.listTasks(statusFilter, priorityFilter, false);
      
      if (tasks.length === 0) {
        console.log('No tasks to export.');
        return false;
      }

      // CSV header
      const headers = ['ID', 'Title', 'Description', 'Priority', 'Status', 'Created At', 'Updated At', 'Due Date', 'Completed At', 'Tags'];
      
      // Create CSV content
      const csvRows = [headers.join(',')];
      
      tasks.forEach(task => {
        const row = [
          this.escapeCSV(task.id),
          this.escapeCSV(task.title),
          this.escapeCSV(task.description),
          this.getPriorityName(task.priority),
          this.escapeCSV(task.status),
          this.formatDate(task.createdAt),
          this.formatDate(task.updatedAt),
          this.formatDate(task.dueDate),
          this.formatDate(task.completedAt),
          this.escapeCSV(task.tags.join(';'))
        ];
        csvRows.push(row.join(','));
      });

      fs.writeFileSync(filePath, csvRows.join('\n'), 'utf8');
      console.log(`Successfully exported ${tasks.length} tasks to ${filePath}`);
      return true;
    } catch (error) {
      console.error(`Error exporting tasks: ${error.message}`);
      return false;
    }
  }

  /**
   * Escape special characters for CSV
   * @param {string} value - Value to escape
   * @returns {string} - Escaped value
   */
  escapeCSV(value) {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = String(value);
    // If the value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  /**
   * Format date for CSV
   * @param {Date} date - Date to format
   * @returns {string} - Formatted date string
   */
  formatDate(date) {
    if (!date) {
      return '';
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return '';
    }
    return d.toISOString();
  }

  /**
   * Get priority name from priority value
   * @param {number} priority - Priority value
   * @returns {string} - Priority name
   */
  getPriorityName(priority) {
    const priorityMap = {
      1: 'LOW',
      2: 'MEDIUM',
      3: 'HIGH',
      4: 'URGENT'
    };
    return priorityMap[priority] || 'UNKNOWN';
  }
}

module.exports = { TaskExporter };
