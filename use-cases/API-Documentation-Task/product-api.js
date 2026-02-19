// Product API - Express.js Implementation
const express = require('express');
const productRouter = express.Router();

// Mock Product Model (in real app, this would be a MongoDB model)
const products = [
  {
    _id: "61fa9bcf5c130b2e6d675432",
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 89.99,
    category: "electronics",
    stockQuantity: 45,
    createdAt: "2023-02-01T15:32:47Z",
    updatedAt: "2023-03-15T09:21:08Z"
  },
  {
    _id: "61fa9bcf5c130b2e6d675433",
    name: "Smartphone Case",
    description: "Protective case for smartphones",
    price: 19.99,
    category: "accessories",
    stockQuantity: 200,
    createdAt: "2023-02-02T10:11:33Z",
    updatedAt: "2023-02-02T10:11:33Z"
  },
  {
    _id: "61fa9bcf5c130b2e6d675435",
    name: "Bluetooth Speaker",
    description: "Portable bluetooth speaker with 20 hour battery life",
    price: 49.99,
    category: "electronics",
    stockQuantity: 32,
    createdAt: "2023-01-25T14:22:19Z",
    updatedAt: "2023-03-10T11:05:24Z"
  },
  {
    _id: "61fa9bcf5c130b2e6d675439",
    name: "T-Shirt",
    description: "Cotton t-shirt with logo",
    price: 24.99,
    category: "clothing",
    stockQuantity: 150,
    createdAt: "2023-01-15T08:27:13Z",
    updatedAt: "2023-01-15T08:27:13Z"
  }
];

// Product Model class (simulating Mongoose model)
class ProductModel {
  static find(filter = {}) {
    let results = [...products];
    
    // Apply category filter
    if (filter.category) {
      results = results.filter(p => p.category === filter.category);
    }
    
    // Apply price filter
    if (filter.price) {
      if (filter.price.$gte !== undefined) {
        results = results.filter(p => p.price >= filter.price.$gte);
      }
      if (filter.price.$lte !== undefined) {
        results = results.filter(p => p.price <= filter.price.$lte);
      }
    }
    
    // Apply stock filter
    if (filter.stockQuantity) {
      if (filter.stockQuantity.$gt !== undefined) {
        results = results.filter(p => p.stockQuantity > filter.stockQuantity.$gt);
      }
    }
    
    return Promise.resolve(results);
  }
  
  static findById(productId) {
    const product = products.find(p => p._id === productId);
    return Promise.resolve(product || null);
  }
  
  static countDocuments(filter = {}) {
    return this.find(filter).then(results => results.length);
  }
}

// Get all products with filtering and pagination
productRouter.get('/', async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
      inStock
    } = req.query;

    // Build filter
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      filter.stockQuantity = { $gt: 0 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Determine sort order
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // Execute query
    const allProducts = await ProductModel.find(filter);
    
    // Apply sorting
    const sortedProducts = allProducts.sort((a, b) => {
      const aVal = a[sort];
      const bVal = b[sort];
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
    
    // Apply pagination
    const paginatedProducts = sortedProducts.slice(skip, skip + parseInt(limit));

    // Get total count for pagination
    const totalProducts = await ProductModel.countDocuments(filter);

    return res.status(200).json({
      products: paginatedProducts,
      pagination: {
        total: totalProducts,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalProducts / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch products'
    });
  }
});

// Get product by ID
productRouter.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Product not found'
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);

    // Check if error is invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid product ID format'
      });
    }

    return res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch product'
    });
  }
});

module.exports = productRouter;
