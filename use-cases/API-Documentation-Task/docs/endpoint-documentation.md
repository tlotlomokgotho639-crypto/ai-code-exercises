# List Products API

Get a list of products with flexible filtering, sorting, and pagination.

## Endpoint

`GET /api/products`

## Description

This endpoint retrieves a list of all products in the inventory with support for filtering by category, price range, and stock availability. Results can be sorted by any field (name, price, createdAt, etc.) in ascending or descending order. The API also supports pagination to handle large datasets efficiently.

## Authentication

No authentication required for this endpoint. This is a public API that can be accessed by any client without authentication.

## Request Parameters

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| category | string | No | - | Filter products by category (e.g., "electronics", "clothing", "accessories") |
| minPrice | number | No | - | Filter products with price greater than or equal to this value |
| maxPrice | number | No | - | Filter products with price less than or equal to this value |
| sort | string | No | createdAt | Field to sort by. Valid values: name, price, category, createdAt, updatedAt, stockQuantity |
| order | string | No | desc | Sort order. Valid values: asc, desc |
| page | number | No | 1 | Page number for pagination (must be >= 1) |
| limit | number | No | 20 | Number of items per page (must be between 1 and 100) |
| inStock | boolean | No | - | When 'true', only show products with stock > 0 |

## Response Format

### Success Response

**Code**: 200 OK

**Content**:

```
json
{
  "products": [
    {
      "_id": "61fa9bcf5c130b2e6d675432",
      "name": "Wireless Headphones",
      "description": "High-quality wireless headphones with noise cancellation",
      "price": 89.99,
      "category": "electronics",
      "stockQuantity": 45,
      "createdAt": "2023-02-01T15:32:47Z",
      "updatedAt": "2023-03-15T09:21:08Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

**Response Fields**:
- `products` (array): Array of product objects
- `pagination` (object): Pagination information
  - `total` (number): Total number of products matching the filter
  - `page` (number): Current page number
  - `limit` (number): Items per page
  - `pages` (number): Total number of pages available

### Error Response

**Code**: 500 Internal Server Error

**Content**:

```
json
{
  "error": "Server error",
  "message": "Failed to fetch products"
}
```

## Product Object Schema

| Field | Type | Description |
|-------|------|-------------|
| _id | string | Unique MongoDB ObjectId identifier for the product |
| name | string | Product name |
| description | string | Product description |
| price | number | Product price (float) |
| category | string | Product category |
| stockQuantity | number | Available quantity in stock |
| createdAt | string | ISO 8601 timestamp of product creation |
| updatedAt | string | ISO 8601 timestamp of last product update |

## Example Requests

### Example 1: Get all products in the "electronics" category

**Request**:

```
GET /api/products?category=electronics
```

**Response**:

```
json
{
  "products": [
    {
      "_id": "61fa9bcf5c130b2e6d675432",
      "name": "Wireless Headphones",
      "description": "High-quality wireless headphones with noise cancellation",
      "price": 89.99,
      "category": "electronics",
      "stockQuantity": 45,
      "createdAt": "2023-02-01T15:32:47Z",
      "updatedAt": "2023-03-15T09:21:08Z"
    },
    {
      "_id": "61fa9bcf5c130b2e6d675435",
      "name": "Bluetooth Speaker",
      "description": "Portable bluetooth speaker with 20 hour battery life",
      "price": 49.99,
      "category": "electronics",
      "stockQuantity": 32,
      "createdAt": "2023-01-25T14:22:19Z",
      "updatedAt": "2023-03-10T11:05:24Z"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### Example 2: Get products with price between $20 and $100, sorted by price ascending

**Request**:

```
GET /api/products?minPrice=20&maxPrice=100&sort=price&order=asc&page=1&limit=10
```

**Response**:

```
json
{
  "products": [
    {
      "_id": "61fa9bcf5c130b2e6d675439",
      "name": "T-Shirt",
      "description": "Cotton t-shirt with logo",
      "price": 24.99,
      "category": "clothing",
      "stockQuantity": 150,
      "createdAt": "2023-01-15T08:27:13Z",
      "updatedAt": "2023-01-15T08:27:13Z"
    },
    {
      "_id": "61fa9bcf5c130b2e6d675435",
      "name": "Bluetooth Speaker",
      "description": "Portable bluetooth speaker with 20 hour battery life",
      "price": 49.99,
      "category": "electronics",
      "stockQuantity": 32,
      "createdAt": "2023-01-25T14:22:19Z",
      "updatedAt": "2023-03-10T11:05:24Z"
    }
  ],
  "pagination": {
    "total": 18,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

### Example 3: Get only products in stock

**Request**:

```
GET /api/products?inStock=true
```

**Response**:

```
json
{
  "products": [
    {
      "_id": "61fa9bcf5c130b2e6d675432",
      "name": "Wireless Headphones",
      "description": "High-quality wireless headphones with noise cancellation",
      "price": 89.99,
      "category": "electronics",
      "stockQuantity": 45,
      "createdAt": "2023-02-01T15:32:47Z",
      "updatedAt": "2023-03-15T09:21:08Z"
    }
  ],
  "pagination": {
    "total": 35,
    "page": 1,
    "limit": 20,
    "pages": 2
  }
}
```

## Rate Limiting

This endpoint is subject to rate limiting. The current rate limit is:
- **100 requests per minute** per IP address
- Rate limit headers are included in the response:
  - `X-RateLimit-Limit`: Maximum requests per minute
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Unix timestamp when the rate limit resets

If you exceed the rate limit, you will receive a `429 Too Many Requests` response.

## Special Considerations

1. **Database**: The API uses MongoDB for data storage. All product IDs are MongoDB ObjectId strings.

2. **Timestamps**: All timestamps are in ISO 8601 format (UTC timezone).

3. **Pagination Limits**: The maximum allowed limit per page is 100 items. Requests with limit > 100 will be capped to 100.

4. **Empty Results**: If no products match the filter criteria, an empty products array is returned with pagination showing total: 0.

5. **Sorting**: Sorting is case-sensitive for string fields. Numeric fields are sorted numerically.

6. **Price Filtering**: When both minPrice and maxPrice are provided, the API returns products where: minPrice <= price <= maxPrice

## Get Product by ID API

### Endpoint

`GET /api/products/:productId`

### Description

Retrieves a single product by its unique identifier.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | Yes | The unique MongoDB ObjectId of the product |

### Response Format

### Success Response

**Code**: 200 OK

**Content**:

```
json
{
  "_id": "61fa9bcf5c130b2e6d675432",
  "name": "Wireless Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "price": 89.99,
  "category": "electronics",
  "stockQuantity": 45,
  "createdAt": "2023-02-01T15:32:47Z",
  "updatedAt": "2023-03-15T09:21:08Z"
}
```

### Error Responses

**Code**: 404 Not Found

```
json
{
  "error": "Not found",
  "message": "Product not found"
}
```

**Code**: 400 Bad Request

```
json
{
  "error": "Invalid ID",
  "message": "Invalid product ID format"
}
```

**Code**: 500 Internal Server Error

```
json
{
  "error": "Server error",
  "message": "Failed to fetch product"
}
```

### Example Request

**Request**:

```
GET /api/products/61fa9bcf5c130b2e6d675432
```

**Response**:

```
json
{
  "_id": "61fa9bcf5c130b2e6d675432",
  "name": "Wireless Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "price": 89.99,
  "category": "electronics",
  "stockQuantity": 45,
  "createdAt": "2023-02-01T15:32:47Z",
  "updatedAt": "2023-03-15T09:21:08Z"
}
