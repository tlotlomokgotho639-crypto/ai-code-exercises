# Performance Analysis: Slow Database Query (JavaScript/Node.js)

## Error Description
The query takes 8-10 seconds to execute for customers with many orders, causing timeout issues in the web application.

## Root Cause Analysis

### 1. Correlated Subqueries (Primary Issue)
The query uses correlated subqueries for `items` and `status_history`:
```
sql
(SELECT json_agg(...) FROM order_items oi WHERE oi.order_id = o.order_id) as items
```
These subqueries are executed for EVERY row returned, creating an N+1 problem. With 1000 orders, this means 1000+ additional executions.

### 2. Missing Database Indexes
No indexes on:
- orders.customer_id (used in WHERE clause)
- orders.order_date (used in date range filter)
- order_items.order_id (used in JOIN)
- order_status_history.order_id (used in JOIN)

### 3. No Pagination
Returns all orders without LIMIT, potentially returning thousands of rows.

### 4. Expensive JSON Aggregation
Using `json_agg` with `json_build_object` for every row is computationally expensive.

## Solution

### 1. Rewrite Query to Use JOINs Instead of Correlated Subqueries
```
javascript
async function getCustomerOrderDetails(customerId, startDate, endDate) {
  try {
    const result = await pool.query(`
      SELECT
        o.order_id,
        o.order_date,
        o.total_amount,
        o.status,
        c.customer_name,
        c.email,
        a.street,
        a.city,
        a.state,
        a.postal_code,
        a.country,
        COALESCE(
          json_agg(
            json_build_object(
              'product_id', p.product_id,
              'product_name', p.name,
              'quantity', oi.quantity,
              'unit_price', p.price,
              'subtotal', (oi.quantity * p.price)
            )
          ) FILTER (WHERE p.product_id IS NOT NULL),
          '[]'
        ) as items,
        COALESCE(
          json_agg(
            json_build_object(
              'status', s.status,
              'date', s.status_date,
              'notes', s.notes
            )
          ) FILTER (WHERE s.status IS NOT NULL),
          '[]'
        ) as status_history
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN addresses a ON o.shipping_address_id = a.address_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN order_status_history s ON o.order_id = s.order_id
      WHERE o.customer_id = $1
        AND o.order_date BETWEEN $2 AND $3
      GROUP BY o.order_id, c.customer_name, c.email, 
               a.street, a.city, a.state, a.postal_code, a.country
      ORDER BY o.order_date DESC
      LIMIT 100
    `, [customerId, startDate, endDate]);

    return result.rows;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}
```

### 2. Add Database Indexes
```
sql
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_customers_customer_id ON customers(customer_id);
```

### 3. Add Pagination
```
javascript
// Add pagination parameters
async function getCustomerOrderDetails(customerId, startDate, endDate, limit = 50, offset = 0) {
  // ... query with LIMIT and OFFSET
  // Add: LIMIT $4 OFFSET $5
}
```

## Learning Points

1. **Avoid Correlated Subqueries**: Use JOINs instead for better performance
2. **Index Foreign Keys**: Always index columns used in JOINs and WHERE clauses
3. **Implement Pagination**: Never return unlimited rows
4. **Use EXPLAIN ANALYZE**: Use PostgreSQL's EXPLAIN ANALYZE to identify slow queries
5. **Connection Pooling**: Already using pg Pool, which is good

## Tools to Measure Bottlenecks

1. **PostgreSQL EXPLAIN ANALYZE**: `EXPLAIN ANALYZE your_query`
2. **pg_stat_statements**: Track query performance
3. **Node.js profiler**: `node --prof` for CPU profiling
4. **New Relic or similar**: Application performance monitoring
