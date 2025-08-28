import {
  users,
  vendors,
  customers,
  items,
  salesTransactions,
  salesTransactionItems,
  purchaseTransactions,
  purchaseTransactionItems,
  vatLedgerEntries,
  type User,
  type InsertUser,
  type Vendor,
  type InsertVendor,
  type Customer,
  type InsertCustomer,
  type Item,
  type InsertItem,
  type SalesTransaction,
  type InsertSalesTransaction,
  type SalesTransactionItem,
  type InsertSalesTransactionItem,
  type PurchaseTransaction,
  type InsertPurchaseTransaction,
  type PurchaseTransactionItem,
  type InsertPurchaseTransactionItem,
  type VatLedgerEntry,
  type InsertVatLedgerEntry,
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (simple auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createDefaultUser(): Promise<void>;

  // Vendor operations
  getVendors(): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor>;
  deleteVendor(id: string): Promise<void>;

  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;

  // Item operations
  getItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, item: Partial<InsertItem>): Promise<Item>;
  deleteItem(id: string): Promise<void>;
  updateItemStock(itemId: string, quantityChange: number): Promise<void>;

  // Sales operations
  getSalesTransactions(limit?: number, offset?: number): Promise<SalesTransaction[]>;
  getSalesTransaction(id: string): Promise<SalesTransaction | undefined>;
  createSalesTransaction(
    transaction: InsertSalesTransaction,
    items: InsertSalesTransactionItem[]
  ): Promise<SalesTransaction>;
  getSalesTransactionItems(transactionId: string): Promise<SalesTransactionItem[]>;

  // Purchase operations
  getPurchaseTransactions(limit?: number, offset?: number): Promise<PurchaseTransaction[]>;
  getPurchaseTransaction(id: string): Promise<PurchaseTransaction | undefined>;
  createPurchaseTransaction(
    transaction: InsertPurchaseTransaction,
    items: InsertPurchaseTransactionItem[]
  ): Promise<PurchaseTransaction>;
  getPurchaseTransactionItems(transactionId: string): Promise<PurchaseTransactionItem[]>;

  // VAT ledger operations
  getVatLedgerEntries(fromDate?: Date, toDate?: Date): Promise<VatLedgerEntry[]>;
  createVatLedgerEntry(entry: InsertVatLedgerEntry): Promise<VatLedgerEntry>;

  // Dashboard statistics
  getDashboardStats(): Promise<{
    todaySales: number;
    vatPayable: number;
    totalInventory: number;
    netProfit: number;
    recentSales: any[];
    lowStockItems: any[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async createDefaultUser(): Promise<void> {
    const existingUser = await this.getUserByUsername('admin');
    if (!existingUser) {
      // Hash the password for admin123
      const { scrypt, randomBytes } = await import("crypto");
      const { promisify } = await import("util");
      const scryptAsync = promisify(scrypt);
      
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync('admin123', salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;

      await this.createUser({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@nepal-pos.com',
        firstName: 'Admin',
        lastName: 'User',
      });
    }
  }

  // Vendor operations
  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).orderBy(desc(vendors.createdAt));
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor> {
    const [updatedVendor] = await db
      .update(vendors)
      .set({ ...vendor, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();
    return updatedVendor;
  }

  async deleteVendor(id: string): Promise<void> {
    await db.delete(vendors).where(eq(vendors.id, id));
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Item operations
  async getItems(): Promise<Item[]> {
    return await db.select().from(items).orderBy(desc(items.createdAt));
  }

  async getItem(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db.insert(items).values(item).returning();
    return newItem;
  }

  async updateItem(id: string, item: Partial<InsertItem>): Promise<Item> {
    const [updatedItem] = await db
      .update(items)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(items.id, id))
      .returning();
    return updatedItem;
  }

  async deleteItem(id: string): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }

  async updateItemStock(itemId: string, quantityChange: number): Promise<void> {
    await db
      .update(items)
      .set({
        stockQuantity: sql`${items.stockQuantity} + ${quantityChange}`,
        updatedAt: new Date(),
      })
      .where(eq(items.id, itemId));
  }

  // Sales operations
  async getSalesTransactions(limit = 100, offset = 0): Promise<SalesTransaction[]> {
    return await db
      .select()
      .from(salesTransactions)
      .orderBy(desc(salesTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getSalesTransaction(id: string): Promise<SalesTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(salesTransactions)
      .where(eq(salesTransactions.id, id));
    return transaction;
  }

  async createSalesTransaction(
    transaction: InsertSalesTransaction,
    transactionItems: InsertSalesTransactionItem[]
  ): Promise<SalesTransaction> {
    return await db.transaction(async (tx) => {
      // Create the main transaction
      const [newTransaction] = await tx
        .insert(salesTransactions)
        .values(transaction)
        .returning();

      // Add items to the transaction
      const itemsToInsert = transactionItems.map((item) => ({
        ...item,
        salesTransactionId: newTransaction.id,
      }));
      await tx.insert(salesTransactionItems).values(itemsToInsert);

      // Update inventory (decrease stock)
      for (const item of transactionItems) {
        await tx
          .update(items)
          .set({
            stockQuantity: sql`${items.stockQuantity} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(items.id, item.itemId));
      }

      // Create VAT ledger entry if VAT is enabled
      if (transaction.vatEnabled && transaction.vatAmount && Number(transaction.vatAmount) > 0) {
        await tx.insert(vatLedgerEntries).values({
          entryType: "sales_output",
          referenceNumber: transaction.invoiceNumber,
          partyName: transaction.customerName || "Walk-in Customer",
          partyVatNumber: "", // Would need to get from customer if available
          taxableAmount: transaction.subtotal,
          vatAmount: transaction.vatAmount,
          vatRate: "13",
          status: "verified",
          salesTransactionId: newTransaction.id,
          userId: transaction.userId,
        });
      }

      return newTransaction;
    });
  }

  async getSalesTransactionItems(transactionId: string): Promise<SalesTransactionItem[]> {
    return await db
      .select()
      .from(salesTransactionItems)
      .where(eq(salesTransactionItems.salesTransactionId, transactionId));
  }

  // Purchase operations
  async getPurchaseTransactions(limit = 100, offset = 0): Promise<PurchaseTransaction[]> {
    return await db
      .select()
      .from(purchaseTransactions)
      .orderBy(desc(purchaseTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPurchaseTransaction(id: string): Promise<PurchaseTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(purchaseTransactions)
      .where(eq(purchaseTransactions.id, id));
    return transaction;
  }

  async createPurchaseTransaction(
    transaction: InsertPurchaseTransaction,
    transactionItems: InsertPurchaseTransactionItem[]
  ): Promise<PurchaseTransaction> {
    return await db.transaction(async (tx) => {
      // Create the main transaction
      const [newTransaction] = await tx
        .insert(purchaseTransactions)
        .values(transaction)
        .returning();

      // Add items to the transaction
      const itemsToInsert = transactionItems.map((item) => ({
        ...item,
        purchaseTransactionId: newTransaction.id,
      }));
      await tx.insert(purchaseTransactionItems).values(itemsToInsert);

      // Update inventory (increase stock)
      for (const item of transactionItems) {
        await tx
          .update(items)
          .set({
            stockQuantity: sql`${items.stockQuantity} + ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(items.id, item.itemId));
      }

      // Create VAT ledger entry if VAT is enabled
      if (transaction.vatEnabled && transaction.vatAmount && Number(transaction.vatAmount) > 0) {
        await tx.insert(vatLedgerEntries).values({
          entryType: "purchase_input",
          referenceNumber: transaction.billNumber,
          partyName: transaction.vendorName,
          partyVatNumber: "", // Would need to get from vendor if available
          taxableAmount: transaction.subtotal,
          vatAmount: transaction.vatAmount,
          vatRate: "13",
          status: "verified",
          purchaseTransactionId: newTransaction.id,
          userId: transaction.userId,
        });
      }

      return newTransaction;
    });
  }

  async getPurchaseTransactionItems(transactionId: string): Promise<PurchaseTransactionItem[]> {
    return await db
      .select()
      .from(purchaseTransactionItems)
      .where(eq(purchaseTransactionItems.purchaseTransactionId, transactionId));
  }

  // VAT ledger operations
  async getVatLedgerEntries(fromDate?: Date, toDate?: Date): Promise<VatLedgerEntry[]> {
    let query = db.select().from(vatLedgerEntries);

    if (fromDate && toDate) {
      query = query.where(
        and(
          gte(vatLedgerEntries.entryDate, fromDate),
          lte(vatLedgerEntries.entryDate, toDate)
        )
      );
    }

    return await query.orderBy(desc(vatLedgerEntries.entryDate));
  }

  async createVatLedgerEntry(entry: InsertVatLedgerEntry): Promise<VatLedgerEntry> {
    const [newEntry] = await db.insert(vatLedgerEntries).values(entry).returning();
    return newEntry;
  }

  // Dashboard statistics
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's sales
    const [todaySalesResult] = await db
      .select({ total: sum(salesTransactions.totalAmount) })
      .from(salesTransactions)
      .where(
        and(
          gte(salesTransactions.saleDate, today),
          lte(salesTransactions.saleDate, tomorrow)
        )
      );

    // VAT payable calculation
    const vatCollected = await db
      .select({ total: sum(vatLedgerEntries.vatAmount) })
      .from(vatLedgerEntries)
      .where(eq(vatLedgerEntries.entryType, "sales_output"));

    const vatPaid = await db
      .select({ total: sum(vatLedgerEntries.vatAmount) })
      .from(vatLedgerEntries)
      .where(eq(vatLedgerEntries.entryType, "purchase_input"));

    // Total inventory value
    const [inventoryResult] = await db
      .select({ 
        total: sql<number>`SUM(${items.stockQuantity} * ${items.costPrice})` 
      })
      .from(items);

    // Recent sales (last 5)
    const recentSales = await db
      .select({
        invoiceNumber: salesTransactions.invoiceNumber,
        customerName: salesTransactions.customerName,
        totalAmount: salesTransactions.totalAmount,
        createdAt: salesTransactions.createdAt,
      })
      .from(salesTransactions)
      .orderBy(desc(salesTransactions.createdAt))
      .limit(5);

    // Low stock items
    const lowStockItems = await db
      .select()
      .from(items)
      .where(sql`${items.stockQuantity} <= ${items.minStockLevel}`)
      .limit(10);

    return {
      todaySales: Number(todaySalesResult?.total || 0),
      vatPayable: Number(vatCollected[0]?.total || 0) - Number(vatPaid[0]?.total || 0),
      totalInventory: Number(inventoryResult?.total || 0),
      netProfit: 0, // Would need more complex calculation with cost of goods sold
      recentSales,
      lowStockItems,
    };
  }
}

export const storage = new DatabaseStorage();
