/**
 * Refactored version of validateUserData
 * Broken down into smaller, focused functions for better readability
 */

// Validation helper functions
const validators = {
  // Username validation
  validateUsername(username, checkExisting = null) {
    const errors = [];
    if (!username || username.trim() === '') {
      errors.push('username is required for registration');
      return errors;
    }
    
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    } else if (username.length > 20) {
      errors.push('Username must be at most 20 characters long');
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    } else if (checkExisting && checkExisting.usernameExists(username)) {
      errors.push('Username is already taken');
    }
    
    return errors;
  },

  // Password validation
  validatePassword(password, confirmPassword) {
    const errors = [];
    if (!password || password.trim() === '') {
      errors.push('password is required for registration');
      return errors;
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    if (confirmPassword !== password) {
      errors.push('Password and confirmation do not match');
    }
    
    return errors;
  },

  // Email validation
  validateEmail(email, isRegistration, checkExisting = null) {
    const errors = [];
    if (email === undefined) {
      if (isRegistration) {
        errors.push('Email is required');
      }
      return errors;
    }
    
    if (email.trim() === '') {
      if (isRegistration) {
        errors.push('Email is required');
      }
      return errors;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Email format is invalid');
    } else if (checkExisting && checkExisting.emailExists(email)) {
      errors.push('Email is already registered');
    }
    
    return errors;
  },

  // Date of birth validation
  validateDateOfBirth(dateOfBirth) {
    const errors = [];
    if (dateOfBirth === undefined || dateOfBirth === '') {
      return errors; // Optional field
    }
    
    const dobDate = new Date(dateOfBirth);
    if (isNaN(dobDate.getTime())) {
      errors.push('Date of birth is not a valid date');
      return errors;
    }
    
    const now = new Date();
    const minAgeDate = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());
    const maxAgeDate = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
    
    if (dobDate > now) {
      errors.push('Date of birth cannot be in the future');
    } else if (dobDate > minAgeDate) {
      errors.push('You must be at least 13 years old');
    } else if (dobDate < maxAgeDate) {
      errors.push('Invalid date of birth (age > 120 years)');
    }
    
    return errors;
  },

  // Address validation
  validateAddress(address) {
    const errors = [];
    if (address === undefined || address === '') {
      return errors; // Optional field
    }
    
    if (typeof address !== 'object') {
      errors.push('Address must be an object with required fields');
      return errors;
    }
    
    const requiredFields = ['street', 'city', 'zip', 'country'];
    for (const field of requiredFields) {
      if (!address[field] || address[field].trim() === '') {
        errors.push(`Address ${field} is required`);
      }
    }
    
    // Zip code validation by country
    if (address.zip && address.country) {
      const countryZipFormats = {
        'US': /^\d{5}(-\d{4})?$/,
        'CA': /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
        'UK': /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/
      };
      
      const regex = countryZipFormats[address.country];
      if (regex && !regex.test(address.zip)) {
        errors.push(`Invalid ${address.country} postal code format`);
      }
    }
    
    return errors;
  },

  // Phone validation
  validatePhone(phone) {
    const errors = [];
    if (phone === undefined || phone === '') {
      return errors; // Optional field
    }
    
    if (!/^\+?[\d\s\-()]{10,15}$/.test(phone)) {
      errors.push('Phone number format is invalid');
    }
    
    return errors;
  }
};

// Main validation function - refactored
function validateUserData(userData, options = {}) {
  const errors = [];
  const isRegistration = options.isRegistration || false;
  const checkExisting = options.checkExisting || null;
  
  const requiredForRegistration = ['username', 'email', 'password', 'confirmPassword'];
  const requiredForProfile = ['firstName', 'lastName', 'dateOfBirth', 'address'];
  
  // Check required fields based on operation type
  const requiredFields = isRegistration ? requiredForRegistration : requiredForProfile;
  
  for (const field of requiredFields) {
    if (!userData[field] || userData[field].toString().trim() === '') {
      errors.push(`${field} is required${isRegistration ? ' for registration' : ''}`);
    }
  }
  
  // Registration-specific validations
  if (isRegistration) {
    errors.push(...validators.validateUsername(userData.username, checkExisting));
    errors.push(...validators.validatePassword(userData.password, userData.confirmPassword));
  } else {
    // Profile update: check for empty values if provided
    for (const field of requiredForProfile) {
      if (userData[field] !== undefined && userData[field].toString().trim() === '') {
        errors.push(`${field} cannot be empty if provided`);
      }
    }
  }
  
  // Email validation (both registration and profile)
  errors.push(...validators.validateEmail(userData.email, isRegistration, checkExisting));
  
  // Date of birth validation
  errors.push(...validators.validateDateOfBirth(userData.dateOfBirth));
  
  // Address validation
  errors.push(...validators.validateAddress(userData.address));
  
  // Phone validation
  errors.push(...validators.validatePhone(userData.phone));
  
  // Custom field validations
  if (options.customValidations) {
    for (const validation of options.customValidations) {
      const field = validation.field;
      
      if (userData[field] !== undefined) {
        const valid = validation.validator(userData[field], userData);
        
        if (!valid) {
          errors.push(validation.message || `Invalid value for ${field}`);
        }
      }
    }
  }
  
  return errors;
}

// Export for testing
module.exports = { 
  validateUserData,
  validators
};
