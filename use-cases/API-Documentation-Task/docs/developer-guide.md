# Developer Guide: Products API

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Making Requests](#making-requests)
5. [Handling Responses](#handling-responses)
6. [Error Handling](#error-handling)
7. [Code Examples](#code-examples)
8. [Best Practices](#best-practices)

## Introduction

This guide provides comprehensive instructions for developers integrating with the Products API. The API allows you to:
- Browse the product catalog
- Filter products by category, price range, and stock availability
- Sort results by various fields
- Paginate through large result sets
- Retrieve individual product details

**Base URL**: `https://api.example.com/api`

**Target Audience**: Developers with intermediate experience in REST APIs and JavaScript/Node.js

**Tone**: Technical but accessible

---

## Authentication

**No authentication required** for this API. All endpoints are public and can be accessed without any authentication tokens or API keys.

However, the API implements rate limiting to ensure fair usage (see [Rate Limiting](#rate-limiting)).

---

## API Endpoints

### 1. List Products
```
GET /api/products
```

Retrieves a paginated list of products with optional filtering.

### 2. Get Product by ID
```
GET /api/products/:productId
```

Retrieves a single product by its unique identifier.

---

## Making Requests

### Request Format

All parameters are passed as **query parameters** in the URL:

```
GET /api/products?category=electronics&minPrice=20&maxPrice=100&sort=price&order=asc&page=1&limit=10
```

### Available Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `minPrice` | number | Minimum price (inclusive) |
| `maxPrice` | number | Maximum price (inclusive) |
| `sort` | string | Sort field (name, price, createdAt, etc.) |
| `order` | string | Sort order: "asc" or "desc" |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |
| `inStock` | boolean | Show only in-stock items |

---

## Handling Responses

### Success Response (200 OK)

```
json
{
  "products": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

### Response Fields

- **`products`**: Array of product objects
- **`pagination`**: Navigation information
  - `total`: Total matching products
  - `page`: Current page
  - `limit`: Items per page
  - `pages`: Total pages available

---

## Error Handling

The API returns standard HTTP status codes to indicate success or failure:

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad Request - invalid parameters |
| 404 | Not Found - product doesn't exist |
| 429 | Too Many Requests - rate limit exceeded |
| 500 | Server Error |

### Error Response Format

```
json
{
  "error": "Error type",
  "message": "Human-readable message"
}
```

---

## Code Examples

### Example 1: Basic Product Listing

```
javascript
// Fetch all products
async function getAllProducts() {
  try {
    const response = await fetch('https://api.example.com/api/products');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
}

// Usage
getAllProducts()
  .then(products => {
    console.log(`Found ${products.length} products`);
    products.forEach(product => {
      console.log(`- ${product.name}: $${product.price}`);
    });
  });
```

### Example 2: Filtered Search with Pagination

```
javascript
// Fetch electronics under $100, sorted by price
async function searchElectronics(maxPrice = 100, page = 1) {
  const params = new URLSearchParams({
    category: 'electronics',
    maxPrice: maxPrice.toString(),
    sort: 'price',
    order: 'asc',
    page: page.toString(),
    limit: '10'
  });
  
  const url = `https://api.example.com/api/products?${params}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      products: data.products,
      pagination: data.pagination
    };
  } catch (error) {
    console.error('Search failed:', error.message);
    throw error;
  }
}

// Usage - Get first page of cheap electronics
searchElectronics(100, 1)
  .then(({ products, pagination }) => {
    console.log(`Page ${pagination.page} of ${pagination.pages}`);
    console.log(`Total results: ${pagination.total}`);
    
    products.forEach(product => {
      console.log(`${product.name} - $${product.price}`);
    });
  });
```

### Example 3: Get Single Product

```
javascript
// Fetch product by ID
async function getProduct(productId) {
  const url = `https://api.example.com/api/products/${productId}`;
  
  try {
    const response = await fetch(url);
    
    if (response.status === 404) {
      console.log('Product not found');
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error.message);
    throw error;
  }
}

// Usage
getProduct('61fa9bcf5c130b2e6d675432')
  .then(product => {
    if (product) {
      console.log(`Product: ${product.name}`);
      console.log(`Price: $${product.price}`);
      console.log(`In stock: ${product.stockQuantity} units`);
    }
  });
```

### Example 4: Error Handling with Rate Limiting

```
javascript
// Robust API client with retry logic
class ProductAPIClient {
  constructor(baseUrl = 'https://api.example.com/api') {
    this.baseUrl = baseUrl;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }
  
  async fetchWithRetry(endpoint, options = {}, retries = 0) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, options);
      
      // Handle rate limiting
      if (response.status === 429) {
        if (retries < this.maxRetries) {
          console.log(`Rate limited. Retrying in ${this.retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          return this.fetchWithRetry(endpoint, options, retries + 1);
        }
        throw new Error('Rate limit exceeded - please try again later');
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (retries < this.maxRetries && error.message.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.fetchWithRetry(endpoint, options, retries + 1);
      }
      throw error;
    }
  }
  
  async listProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    return this.fetchWithRetry(endpoint);
  }
  
  async getProduct(productId) {
    return this.fetchWithRetry(`/products/${productId}`);
  }
}

// Usage
const client = new ProductAPIClient();

// List products
client.listProducts({ category: 'electronics', limit: 5 })
  .then(data => {
    console.log('Products:', data.products);
    console.log('Pagination:', data.pagination);
  })
  .catch(err => console.error('Failed:', err.message));

// Get single product
client.getProduct('61fa9bcf5c130b2e6d675432')
  .then(product => console.log('Product:', product))
  .catch(err => console.error('Failed:', err.message));
```

### Example 5: Complete Application Example

```
javascript
// Complete example: Product browser with UI
class ProductBrowser {
  constructor() {
    this.api = new ProductAPIClient();
    this.products = [];
    this.currentPage = 1;
    this.filters = {};
  }
  
  async loadProducts() {
    try {
      // Build filters
      const params = {
        ...this.filters,
        page: this.currentPage,
        limit: 20
      };
      
      const data = await this.api.listProducts(params);
      this.products = data.products;
      this.pagination = data.pagination;
      
      this.render();
    } catch (error) {
      this.showError(error.message);
    }
  }
  
  async filterByCategory(category) {
    this.filters.category = category;
    this.currentPage = 1;
    await this.loadProducts();
  }
  
  async filterByPriceRange(min, max) {
    if (min) this.filters.minPrice = min;
    if (max) this.filters.maxPrice = max;
    this.currentPage = 1;
    await this.loadProducts();
  }
  
  async nextPage() {
    if (this.currentPage < this.pagination.pages) {
      this.currentPage++;
      await this.loadProducts();
    }
  }
  
  async previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      await this.loadProducts();
    }
  }
  
  render() {
    console.clear();
    console.log('=== Product Browser ===');
    console.log(`Page ${this.pagination.page} of ${this.pagination.pages}`);
    console.log(`Showing ${this.products.length} of ${this.pagination.total} products\n`);
    
    this.products.forEach(product => {
      const stockStatus = product.stockQuantity > 0 ? '✓ In Stock' : '✗ Out of Stock';
      console.log(`${product.name}`);
      console.log(`  Category: ${product.category}`);
      console.log(`  Price: $${product.price.toFixed(2)}`);
      console.log(`  Stock: ${stockStatus}`);
      console.log('');
    });
    
    console.log('Navigation: [P] Previous | [N] Next | [Q] Quit');
  }
  
  showError(message) {
    console.error(`Error: ${message}`);
  }
}

// Run the browser
const browser = new ProductBrowser();
browser.loadProducts();
```

---

## Rate Limiting

The API limits requests to **100 requests per minute** per IP address.

### Handling Rate Limits

When you exceed the rate limit, you'll receive a `429 Too Many Requests` response.

**Best practices:**
1. Implement exponential backoff for retries
2. Cache frequently accessed data
3. Batch requests when possible
4. Monitor your request count

---

## Best Practices

### 1. Always Handle Errors
```
javascript
try {
  const response = await fetch(url);
  if (!response.ok) {
    // Handle specific error codes
  }
} catch (error) {
  // Handle network errors
}
```

### 2. Use Pagination for Large Datasets
```
javascript
// Don't fetch everything at once
const params = { page: 1, limit: 20 };
```

### 3. Validate Input Parameters
```
javascript
function validatePriceRange(min, max) {
  if (min !== undefined && min < 0) {
    throw new Error('minPrice cannot be negative');
  }
  if (max !== undefined && max < 0) {
    throw new Error('maxPrice cannot be negative');
  }
  if (min !== undefined && max !== undefined && min > max) {
    throw new Error('minPrice cannot be greater than maxPrice');
  }
}
```

### 4. Cache When Appropriate
```
javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getProductsCached(params) {
  const key = JSON.stringify(params);
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await getProducts(params);
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### 5. Use Async/Await for Cleaner Code
```
javascript
// ✅ Good - async/await
const data = await fetchProducts();

// ❌ Avoid - Promise chains
fetchProducts().then(data => { ... });
```

---

## Summary

This guide covered:
- ✅ How to authenticate (no auth needed)
- ✅ How to format requests with query parameters
- ✅ How to interpret responses and pagination
- ✅ How to handle common errors
- ✅ JavaScript code examples for various use cases
- ✅ Best practices for API integration

For more information, see the [Endpoint Documentation](./endpoint-documentation.md) and [OpenAPI Specification](./openapi-spec.json).
