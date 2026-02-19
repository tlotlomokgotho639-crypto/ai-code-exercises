const request = require('supertest');
const express = require('express');
const productRouter = require('../product-api');

// Create a test Express app that uses the product router
const app = express();
app.use('/', productRouter);

describe('Product API', () => {
  describe('GET /', () => {
    test('should return all products without filters', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body.products).toBeDefined();
      expect(response.body.products.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(response.body.products.length);
    });
    
    test('should filter products by category', async () => {
      const response = await request(app).get('/?category=electronics');
      
      expect(response.status).toBe(200);
      expect(response.body.products).toBeDefined();
      response.body.products.forEach(product => {
        expect(product.category).toBe('electronics');
      });
    });
    
    test('should filter products by minPrice', async () => {
      const response = await request(app).get('/?minPrice=50');
      
      expect(response.status).toBe(200);
      expect(response.body.products).toBeDefined();
      response.body.products.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(50);
      });
    });
    
    test('should filter products by maxPrice', async () => {
      const response = await request(app).get('/?maxPrice=30');
      
      expect(response.status).toBe(200);
      expect(response.body.products).toBeDefined();
      response.body.products.forEach(product => {
        expect(product.price).toBeLessThanOrEqual(30);
      });
    });
    
    test('should filter products by price range', async () => {
      const response = await request(app).get('/?minPrice=20&maxPrice=60');
      
      expect(response.status).toBe(200);
      expect(response.body.products).toBeDefined();
      response.body.products.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(20);
        expect(product.price).toBeLessThanOrEqual(60);
      });
    });
    
    test('should filter products that are in stock', async () => {
      const response = await request(app).get('/?inStock=true');
      
      expect(response.status).toBe(200);
      expect(response.body.products).toBeDefined();
      response.body.products.forEach(product => {
        expect(product.stockQuantity).toBeGreaterThan(0);
      });
    });
    
    test('should sort products by price ascending', async () => {
      const response = await request(app).get('/?sort=price&order=asc');
      
      expect(response.status).toBe(200);
      expect(response.body.products).toBeDefined();
      // Verify ascending order
      for (let i = 0; i < response.body.products.length - 1; i++) {
        expect(response.body.products[i].price).toBeLessThanOrEqual(response.body.products[i + 1].price);
      }
    });
    
    test('should sort products by price descending', async () => {
      const response = await request(app).get('/?sort=price&order=desc');
      
      expect(response.status).toBe(200);
      expect(response.body.products).toBeDefined();
      // Verify descending order
      for (let i = 0; i < response.body.products.length - 1; i++) {
        expect(response.body.products[i].price).toBeGreaterThanOrEqual(response.body.products[i + 1].price);
      }
    });
  });
});
