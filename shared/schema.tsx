import { sql, relations } from "drizzle-orm";
import {
  index,
  sqliteTable,
  integer,
  text,
  real,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Sessions
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(), // JSON stored as TEXT
    expire: integer("expire", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users
export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`), // uuid-ish
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Vendors
export const vendors = sqliteTable("vendors", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  vatNumber: text("vat_number"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  paymentTerms: text("payment_terms"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Customers
export const customers = sqliteTable("customers", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  vatNumber: text("vat_number"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  creditLimit: real("credit_limit").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Items
export const items = sqliteTable("items", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  category: text("category"),
  brand: text("brand"),
  costPrice: real("cost_price").notNull(),
  sellingPrice: real("selling_price").notNull(),
  wholesalePrice: real("wholesale_price"),
  stockQuantity: integer("stock_quantity").default(0),
  openingQuantity: integer("opening_quantity").default(0),
  minStockLevel: integer("min_stock_level").default(0),
  unit: text("unit").default("pcs"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Sales Transactions
export const salesTransactions = sqliteTable("sales_transactions", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: text("customer_id"),
  customerName: text("customer_name"),
  saleDate: integer("sale_date", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  subtotal: real("subtotal").notNull(),
  discountPercent: real("discount_percent").default(0),
  discountAmount: real("discount_amount").default(0),
  vatEnabled: integer("vat_enabled", { mode: "boolean" }).default(true),
  vatAmount: real("vat_amount").default(0),
  totalAmount: real("total_amount").notNull(),
  paymentMethod: text("payment_method").default("cash"),
  paymentStatus: text("payment_status").default("paid"),
  userId: text("user_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Sales Transaction Items
export const salesTransactionItems = sqliteTable("sales_transaction_items", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  salesTransactionId: text("sales_transaction_id").notNull(),
  itemId: text("item_id").notNull(),
  itemName: text("item_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  discountPercent: real("discount_percent").default(0),
  discountAmount: real("discount_amount").default(0),
  totalPrice: real("total_price").notNull(),
});

// Purchase Transactions
export const purchaseTransactions = sqliteTable("purchase_transactions", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  billNumber: text("bill_number").notNull(),
  vendorId: text("vendor_id"),
  vendorName: text("vendor_name").notNull(),
  purchaseDate: integer("purchase_date", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  subtotal: real("subtotal").notNull(),
  discountPercent: real("discount_percent").default(0),
  discountAmount: real("discount_amount").default(0),
  exciseAmount: real("excise_amount").default(0),
  vatEnabled: integer("vat_enabled", { mode: "boolean" }).default(true),
  vatAmount: real("vat_amount").default(0),
  totalAmount: real("total_amount").notNull(),
  paymentTerms: text("payment_terms"),
  paymentStatus: text("payment_status").default("pending"),
  includeExciseInAccounting: integer("include_excise_in_accounting", { mode: "boolean" }).default(false),
  userId: text("user_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Purchase Transaction Items
export const purchaseTransactionItems = sqliteTable("purchase_transaction_items", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  purchaseTransactionId: text("purchase_transaction_id").notNull(),
  itemId: text("item_id").notNull(),
  itemName: text("item_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  discountPercent: real("discount_percent").default(0),
  discountAmount: real("discount_amount").default(0),
  exciseAmount: real("excise_amount").default(0),
  totalPrice: real("total_price").notNull(),
});

// VAT Ledger Entries
export const vatLedgerEntries = sqliteTable("vat_ledger_entries", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  entryDate: integer("entry_date", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  entryType: text("entry_type").notNull(),
  referenceNumber: text("reference_number").notNull(),
  partyName: text("party_name").notNull(),
  partyVatNumber: text("party_vat_number"),
  taxableAmount: real("taxable_amount").notNull(),
  vatAmount: real("vat_amount").notNull(),
  vatRate: real("vat_rate").default(13),
  status: text("status").default("verified"),
  salesTransactionId: text("sales_transaction_id"),
  purchaseTransactionId: text("purchase_transaction_id"),
  userId: text("user_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Relations (unchanged)
export const vendorsRelations = relations(vendors, ({ many }) => ({
  purchaseTransactions: many(purchaseTransactions),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  salesTransactions: many(salesTransactions),
}));

export const itemsRelations = relations(items, ({ many }) => ({
  salesTransactionItems: many(salesTransactionItems),
  purchaseTransactionItems: many(purchaseTransactionItems),
}));

export const salesTransactionsRelations = relations(salesTransactions, ({ one, many }) => ({
  customer: one(customers, {
    fields: [salesTransactions.customerId],
    references: [customers.id],
  }),
  items: many(salesTransactionItems),
  vatLedgerEntry: one(vatLedgerEntries, {
    fields: [salesTransactions.id],
    references: [vatLedgerEntries.salesTransactionId],
  }),
}));

export const purchaseTransactionsRelations = relations(purchaseTransactions, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [purchaseTransactions.vendorId],
    references: [vendors.id],
  }),
  items: many(purchaseTransactionItems),
  vatLedgerEntry: one(vatLedgerEntries, {
    fields: [purchaseTransactions.id],
    references: [vatLedgerEntries.purchaseTransactionId],
  }),
}));

export const salesTransactionItemsRelations = relations(salesTransactionItems, ({ one }) => ({
  salesTransaction: one(salesTransactions, {
    fields: [salesTransactionItems.salesTransactionId],
    references: [salesTransactions.id],
  }),
  item: one(items, {
    fields: [salesTransactionItems.itemId],
    references: [items.id],
  }),
}));

export const purchaseTransactionItemsRelations = relations(purchaseTransactionItems, ({ one }) => ({
  purchaseTransaction: one(purchaseTransactions, {
    fields: [purchaseTransactionItems.purchaseTransactionId],
    references: [purchaseTransactions.id],
  }),
  item: one(items, {
    fields: [purchaseTransactionItems.itemId],
    references: [items.id],
  }),
}));

// Insert Schemas (same)
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSalesTransactionSchema = createInsertSchema(salesTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertSalesTransactionItemSchema = createInsertSchema(salesTransactionItems).omit({
  id: true,
});

export const insertPurchaseTransactionSchema = createInsertSchema(purchaseTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseTransactionItemSchema = createInsertSchema(purchaseTransactionItems).omit({
  id: true,
});

export const insertVatLedgerEntrySchema = createInsertSchema(vatLedgerEntries).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type SalesTransaction = typeof salesTransactions.$inferSelect;
export type InsertSalesTransaction = z.infer<typeof insertSalesTransactionSchema>;
export type SalesTransactionItem = typeof salesTransactionItems.$inferSelect;
export type InsertSalesTransactionItem = z.infer<typeof insertSalesTransactionItemSchema>;
export type PurchaseTransaction = typeof purchaseTransactions.$inferSelect;
export type InsertPurchaseTransaction = z.infer<typeof insertPurchaseTransactionSchema>;
export type PurchaseTransactionItem = typeof purchaseTransactionItems.$inferSelect;
export type InsertPurchaseTransactionItem = z.infer<typeof insertPurchaseTransactionItemSchema>;
export type VatLedgerEntry = typeof vatLedgerEntries.$inferSelect;
export type InsertVatLedgerEntry = z.infer<typeof insertVatLedgerEntrySchema>;
