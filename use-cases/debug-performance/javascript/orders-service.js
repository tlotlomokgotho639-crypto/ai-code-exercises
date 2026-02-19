// orders-service.js
const { Pool } = require('pg');

// Database connection - use environment variables with fallbacks
const pool = new Pool({
  user: process.env.DB_USER || 'app_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ecommerce',
  password: process.env.DB_PASSWORD || 'password123',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Default pagination settings
const DEFAULT_LIMIT = 50;
const DEFAULT_OFFSET = 0;

// Log connection info when service starts
console.log(`Database connection: ${process.env.DB_USER || 'app_user'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'ecommerce'}`);

/**
 * OPTIMIZED: Rewrote query to use JOINs instead of correlated subqueries
 * This eliminates the N+1 problem where subqueries were executed for each row
 */
async function getCustomerOrderDetails(customerId, startDate, endDate, limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET) {
  try {
    // Optimized query using JOINs instead of correlated subqueries
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
      LEFT JOIN LATERAL (
        SELECT s.status, s.status_date, s.notes
        FROM order_status_history s
        WHERE s.order_id = o.order_id
        ORDER BY s.status_date DESC
        LIMIT 10
      ) s ON true
      WHERE o.customer_id = $1
        AND o.order_date BETWEEN $2 AND $3
      GROUP BY o.order_id, o.order_date, o.total_amount, o.status, 
               c.customer_name, c.email, 
               a.street, a.city, a.state, a.postal_code, a.country
      ORDER BY o.order_date DESC
      LIMIT $4 OFFSET $5
    `, [customerId, startDate, endDate, limit, offset]);

    return result.rows;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}

// Example usage in Express route handler
async function getOrdersHandler(req, res) {
  try {
    const { customerId } = req.params;
    const { 
      startDate = '2023-01-01', 
      endDate = '2023-12-31',
      limit = DEFAULT_LIMIT,
      offset = DEFAULT_OFFSET
    } = req.query;

    const orders = await getCustomerOrderDetails(
      customerId, 
      startDate, 
      endDate,
      Math.min(parseInt(limit) || DEFAULT_LIMIT, 100), // Cap limit at 100
      parseInt(offset) || DEFAULT_OFFSET
    );

    res.json({
      success: true,
      count: orders.length,
      data: orders,
      pagination: {
        limit: parseInt(limit) || DEFAULT_LIMIT,
        offset: parseInt(offset) || DEFAULT_OFFSET
      }
    });
  } catch (error) {
    console.error('Error in getOrdersHandler:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while fetching orders'
    });
  }
}

/**
 * Database Index Creation Script
 * Run these SQL commands to create necessary indexes for optimal performance
 */
async function createIndexes() {
  const indexSQL = [
    'CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);',
    'CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);',
    'CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);',
    'CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);',
    'CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON customers(customer_id);'
  ];
  
  for (const sql of indexSQL) {
    try {
      await pool.query(sql);
      console.log(`Created index: ${sql.split(' ')[5]}`);
    } catch (err) {
      console.error(`Error creating index:`, err.message);
    }
  }
}

module.exports = {
  getCustomerOrderDetails,
  getOrdersHandler,
  createIndexes
};
