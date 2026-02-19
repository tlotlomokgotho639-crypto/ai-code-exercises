/**
 * Refactored version of calculateUserStatistics
 * Eliminated code duplication by creating helper functions
 */

// Helper function to calculate average of a property
function calculateAverage(data, property) {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, item) => acc + item[property], 0);
  return sum / data.length;
}

// Helper function to find highest value of a property
function findHighest(data, property) {
  if (data.length === 0) return 0;
  return data.reduce((max, item) => item[property] > max ? item[property] : max, data[0][property]);
}

// Refactored function using helper functions
function calculateUserStatistics(userData) {
  // Handle empty array case
  if (!userData || userData.length === 0) {
    return {
      age: { average: 0, highest: 0 },
      income: { average: 0, highest: 0 },
      score: { average: 0, highest: 0 }
    };
  }

  return {
    age: {
      average: calculateAverage(userData, 'age'),
      highest: findHighest(userData, 'age')
    },
    income: {
      average: calculateAverage(userData, 'income'),
      highest: findHighest(userData, 'income')
    },
    score: {
      average: calculateAverage(userData, 'score'),
      highest: findHighest(userData, 'score')
    }
  };
}

// Alternative approach using a more generic function
function calculateStatistics(userData, properties) {
  if (!userData || userData.length === 0) {
    const emptyResult = {};
    properties.forEach(prop => {
      emptyResult[prop] = { average: 0, highest: 0 };
    });
    return emptyResult;
  }

  const result = {};
  properties.forEach(property => {
    result[property] = {
      average: calculateAverage(userData, property),
      highest: findHighest(userData, property)
    };
  });
  return result;
}

// Usage with generic function
function calculateUserStatisticsGeneric(userData) {
  return calculateStatistics(userData, ['age', 'income', 'score']);
}

// Export for testing
module.exports = { 
  calculateUserStatistics, 
  calculateUserStatisticsGeneric,
  calculateAverage,
  findHighest,
  calculateStatistics
};
