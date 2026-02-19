/**
 * Refactored version of the inventory processing function
 * Uses meaningful variable names for better readability
 */

/**
 * Process inventory orders by checking availability and calculating totals
 * @param {Array} requestedItems - Array of items being ordered {id, price}
 * @param {Array} inventory - Array of inventory items {id, quantity}
 * @param {number} quantityOrdered - Quantity being ordered for each item
 * @returns {Object} Result with successful items and total price
 */
function processInventory(requestedItems, inventory, quantityOrdered) {
  const successfulItems = [];
  let totalPrice = 0;

  for (let i = 0; i < requestedItems.length; i++) {
    const currentItem = requestedItems[i];
    let isAvailable = false;

    // Find the item in inventory
    for (let j = 0; j < inventory.length; j++) {
      if (currentItem.id === inventory[j].id) {
        isAvailable = true;
        
        // Check if sufficient quantity is available
        if (inventory[j].quantity >= quantityOrdered) {
          // Add to successful items
          successfulItems.push(currentItem);
          
          // Calculate price and update inventory
          totalPrice += currentItem.price * quantityOrdered;
          inventory[j].quantity -= quantityOrdered;
        }
        break;
      }
    }

    // Log if item is not available
    if (!isAvailable) {
      console.log("Item " + currentItem.id + " not available");
    }
  }

  return {
    items: successfulItems,
    total: totalPrice
  };
}

// Export for testing
module.exports = { processInventory };

// Unit tests
function runTests() {
  console.log("Running tests for inventory processing function...");

  // Test Case 1: Basic functionality
  let testCase1 = () => {
    const requestedItems = [
      { id: "item1", price: 10 },
      { id: "item2", price: 20 },
      { id: "item3", price: 30 }
    ];

    const inventory = [
      { id: "item1", quantity: 5 },
      { id: "item2", quantity: 3 },
      { id: "item3", quantity: 1 }
    ];

    const quantityOrdered = 2;

    const result = processInventory(requestedItems, inventory, quantityOrdered);

    // Verify result
    let success = true;

    // Should have 2 successful items
    if (result.items.length !== 2) {
      console.error(`FAILED: Expected 2 successful items, got ${result.items.length}`);
      success = false;
    }

    // Total should be 60 (10*2 + 20*2)
    if (result.total !== 60) {
      console.error(`FAILED: Expected total 60, got ${result.total}`);
      success = false;
    }

    // Inventory should be updated correctly
    if (inventory[0].quantity !== 3 || inventory[1].quantity !== 1 || inventory[2].quantity !== 1) {
      console.error(`FAILED: Inventory not updated correctly`);
      success = false;
    }

    return success;
  };

  // Test Case 2: No items available in sufficient quantity
  let testCase2 = () => {
    const requestedItems = [
      { id: "item1", price: 10 }
    ];

    const inventory = [
      { id: "item1", quantity: 1 }
    ];

    const quantityOrdered = 2;

    const result = processInventory(requestedItems, inventory, quantityOrdered);

    // Verify result
    let success = true;

    // Should have 0 successful items
    if (result.items.length !== 0) {
      console.error(`FAILED: Expected 0 successful items, got ${result.items.length}`);
      success = false;
    }

    // Total should be 0
    if (result.total !== 0) {
      console.error(`FAILED: Expected total 0, got ${result.total}`);
      success = false;
    }

    return success;
  };

  // Test Case 3: Item not found
  let testCase3 = () => {
    const requestedItems = [
      { id: "item1", price: 10 },
      { id: "itemNonExistent", price: 20 }
    ];

    const inventory = [
      { id: "item1", quantity: 5 }
    ];

    const quantityOrdered = 1;

    const result = processInventory(requestedItems, inventory, quantityOrdered);

    // Verify result
    let success = true;

    // Should have 1 successful item
    if (result.items.length !== 1) {
      console.error(`FAILED: Expected 1 successful items, got ${result.items.length}`);
      success = false;
    }

    // Total should be 10
    if (result.total !== 10) {
      console.error(`FAILED: Expected total 10, got ${result.total}`);
      success = false;
    }

    return success;
  };

  // Run all tests
  const test1Result = testCase1();
  const test2Result = testCase2();
  const test3Result = testCase3();

  if (test1Result && test2Result && test3Result) {
    console.log("All tests PASSED ✅");
  } else {
    console.log("Some tests FAILED ❌");
  }
}

// Uncomment to run tests
// runTests();
