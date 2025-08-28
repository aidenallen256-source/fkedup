import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export function isAuthenticated(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}
import {
  insertVendorSchema,
  insertCustomerSchema,
  insertItemSchema,
  insertSalesTransactionSchema,
  insertSalesTransactionItemSchema,
  insertPurchaseTransactionSchema,
  insertPurchaseTransactionItemSchema,
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import * as XLSX from "xlsx";

export function registerRoutes(app: Express): Server {
  // Auth middleware
  setupAuth(app);

  // Multer setup for file uploads
  const upload = multer({ storage: multer.memoryStorage() });

  // Auth routes
  app.get('/api/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard statistics
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Vendor routes
  app.get('/api/vendors', isAuthenticated, async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.get('/api/vendors/:id', isAuthenticated, async (req, res) => {
    try {
      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      console.error("Error fetching vendor:", error);
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });

  app.post('/api/vendors', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(validatedData);
      res.status(201).json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(400).json({ message: "Failed to create vendor" });
    }
  });

  app.put('/api/vendors/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertVendorSchema.partial().parse(req.body);
      const vendor = await storage.updateVendor(req.params.id, validatedData);
      res.json(vendor);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(400).json({ message: "Failed to update vendor" });
    }
  });

  app.delete('/api/vendors/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteVendor(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });

  // Customer routes
  app.get('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: "Failed to create customer" });
    }
  });

  app.put('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, validatedData);
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(400).json({ message: "Failed to update customer" });
    }
  });

  // Item routes
  app.get('/api/items', isAuthenticated, async (req, res) => {
    try {
      const items = await storage.getItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.post('/api/items', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertItemSchema.parse(req.body);
      const item = await storage.createItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(400).json({ message: "Failed to create item" });
    }
  });

  app.put('/api/items/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertItemSchema.partial().parse(req.body);
      const item = await storage.updateItem(req.params.id, validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(400).json({ message: "Failed to update item" });
    }
  });

  // Sales routes
  app.get('/api/sales', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const sales = await storage.getSalesTransactions(limit, offset);
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get('/api/sales/:id', isAuthenticated, async (req, res) => {
    try {
      const transaction = await storage.getSalesTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Sales transaction not found" });
      }
      const items = await storage.getSalesTransactionItems(req.params.id);
      res.json({ ...transaction, items });
    } catch (error) {
      console.error("Error fetching sales transaction:", error);
      res.status(500).json({ message: "Failed to fetch sales transaction" });
    }
  });

  const createSalesSchema = z.object({
    transaction: insertSalesTransactionSchema,
    items: z.array(insertSalesTransactionItemSchema),
  });

  app.post('/api/sales', isAuthenticated, async (req: any, res) => {
    try {
      const { transaction, items } = createSalesSchema.parse(req.body);
      transaction.userId = req.user.id;
      
      const newTransaction = await storage.createSalesTransaction(transaction, items);
      res.status(201).json(newTransaction);
    } catch (error) {
      console.error("Error creating sales transaction:", error);
      res.status(400).json({ message: "Failed to create sales transaction" });
    }
  });

  // Purchase routes
  app.get('/api/purchases', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const purchases = await storage.getPurchaseTransactions(limit, offset);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.get('/api/purchases/:id', isAuthenticated, async (req, res) => {
    try {
      const transaction = await storage.getPurchaseTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Purchase transaction not found" });
      }
      const items = await storage.getPurchaseTransactionItems(req.params.id);
      res.json({ ...transaction, items });
    } catch (error) {
      console.error("Error fetching purchase transaction:", error);
      res.status(500).json({ message: "Failed to fetch purchase transaction" });
    }
  });

  const createPurchaseSchema = z.object({
    transaction: insertPurchaseTransactionSchema,
    items: z.array(insertPurchaseTransactionItemSchema),
  });

  app.post('/api/purchases', isAuthenticated, async (req: any, res) => {
    try {
      const { transaction, items } = createPurchaseSchema.parse(req.body);
      transaction.userId = req.user.id;
      
      const newTransaction = await storage.createPurchaseTransaction(transaction, items);
      res.status(201).json(newTransaction);
    } catch (error) {
      console.error("Error creating purchase transaction:", error);
      res.status(400).json({ message: "Failed to create purchase transaction" });
    }
  });

  // VAT ledger routes
  app.get('/api/vat-ledger', isAuthenticated, async (req, res) => {
    try {
      const fromDate = req.query.fromDate ? new Date(req.query.fromDate as string) : undefined;
      const toDate = req.query.toDate ? new Date(req.query.toDate as string) : undefined;
      
      const entries = await storage.getVatLedgerEntries(fromDate, toDate);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching VAT ledger:", error);
      res.status(500).json({ message: "Failed to fetch VAT ledger" });
    }
  });

  // Excel import route for items
  app.post('/api/items/import', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const items = data.map((row: any) => ({
        name: row['Product Name'] || row['name'] || '',
        category: row['Category'] || row['category'] || '',
        brand: row['Brand'] || row['brand'] || '',
        costPrice: parseFloat(row['CP'] || row['Cost Price'] || row['costPrice'] || '0'),
        sellingPrice: parseFloat(row['SP'] || row['Selling Price'] || row['sellingPrice'] || '0'),
        wholesalePrice: parseFloat(row['Wholesale'] || row['Wholesale Price'] || row['wholesalePrice'] || '0'),
        unit: row['Unit'] || row['unit'] || 'pcs',
        openingQuantity: parseInt(row['Opening Quantity'] || row['openingQuantity'] || '0'),
        stockQuantity: parseInt(row['Opening Quantity'] || row['openingQuantity'] || '0'),
        minStockLevel: 5,
      })).filter((item: any) => item.name && item.costPrice > 0 && item.sellingPrice > 0);

      const createdItems = [];
      for (const item of items) {
        try {
          const createdItem = await storage.createItem(item);
          createdItems.push(createdItem);
        } catch (error) {
          console.error(`Failed to create item: ${item.name}`, error);
        }
      }

      res.json({ 
        message: `Successfully imported ${createdItems.length} items out of ${items.length}`,
        imported: createdItems.length,
        total: items.length
      });
    } catch (error) {
      console.error("Error importing items:", error);
      res.status(500).json({ message: "Failed to import items" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
