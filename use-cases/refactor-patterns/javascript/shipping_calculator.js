/**
 * Refactored shipping calculator using Strategy Pattern
 * Eliminates nested conditionals by using separate strategy classes
 */

// Shipping Strategy Interface
class ShippingStrategy {
  calculate(packageDetails, destinationCountry) {
    throw new Error('Method not implemented');
  }
}

// Standard Shipping Strategy
class StandardShippingStrategy extends ShippingStrategy {
  calculate(packageDetails, destinationCountry) {
    const { weight, length, width, height } = packageDetails;
    
    // Base rates by destination
    const baseRates = {
      'USA': 2.5,
      'Canada': 3.5,
      'Mexico': 4.0,
      'default': 4.5
    };
    
    const rate = baseRates[destinationCountry] || baseRates['default'];
    let cost = weight * rate;
    
    // Dimensional weight adjustment for lightweight bulky packages
    if (weight < 2 && (length * width * height) > 1000) {
      cost += 5.0;
    }
    
    return cost;
  }
}

// Express Shipping Strategy
class ExpressShippingStrategy extends ShippingStrategy {
  calculate(packageDetails, destinationCountry) {
    const { weight, length, width, height } = packageDetails;
    
    const baseRates = {
      'USA': 4.5,
      'Canada': 5.5,
      'Mexico': 6.0,
      'default': 7.5
    };
    
    const rate = baseRates[destinationCountry] || baseRates['default'];
    let cost = weight * rate;
    
    // Large package surcharge
    if ((length * width * height) > 5000) {
      cost += 15.0;
    }
    
    return cost;
  }
}

// Overnight Shipping Strategy
class OvernightShippingStrategy extends ShippingStrategy {
  calculate(packageDetails, destinationCountry) {
    const { weight } = packageDetails;
    
    // Overnight is only available for USA and Canada
    if (destinationCountry !== 'USA' && destinationCountry !== 'Canada') {
      return null; // Not available
    }
    
    const baseRates = {
      'USA': 9.5,
      'Canada': 12.5
    };
    
    return weight * baseRates[destinationCountry];
  }
}

// Shipping Context - executes the chosen strategy
class ShippingCalculator {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  calculate(packageDetails, destinationCountry) {
    const cost = this.strategy.calculate(packageDetails, destinationCountry);
    
    if (cost === null) {
      return "Overnight shipping not available for this destination";
    }
    
    return cost.toFixed(2);
  }
}

// Factory for creating shipping strategies
function createShippingStrategy(method) {
  const strategies = {
    'standard': StandardShippingStrategy,
    'express': ExpressShippingStrategy,
    'overnight': OvernightShippingStrategy
  };
  
  const StrategyClass = strategies[method];
  if (!StrategyClass) {
    throw new Error(`Unknown shipping method: ${method}`);
  }
  
  return new StrategyClass();
}

// Main function - simplified to use strategies
function calculateShippingCost(packageDetails, destinationCountry, shippingMethod) {
  const strategy = createShippingStrategy(shippingMethod);
  const calculator = new ShippingCalculator(strategy);
  return calculator.calculate(packageDetails, destinationCountry);
}

// Export for testing
module.exports = {
  calculateShippingCost,
  ShippingCalculator,
  StandardShippingStrategy,
  ExpressShippingStrategy,
  OvernightShippingStrategy,
  createShippingStrategy
};

// Example usage
const package = { weight: 5, length: 10, width: 10, height: 10 };
console.log(calculateShippingCost(package, 'USA', 'standard'));     // "12.50"
console.log(calculateShippingCost(package, 'Canada', 'express'));    // "27.50"
console.log(calculateShippingCost(package, 'Canada', 'overnight'));   // "62.50"
console.log(calculateShippingCost(package, 'UK', 'overnight'));        // "Overnight shipping not available for this destination"
