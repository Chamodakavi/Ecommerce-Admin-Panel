# Supabase Database Changes for Product Net Profit

This folder contains SQL migration scripts for implementing the Product Net Profit feature.

## Files

### 01_create_product_profit_tracking.sql
Creates the core infrastructure for product profit tracking:
- `product_profit_log` table - stores profit data per invoice item
- Database views for yearly, monthly, and product-wise profit summaries
- PostgreSQL function `log_invoice_product_profit()` - automatically logs profit when invoices are created
- Indexes for query performance
- RLS policies

**Run this first** in your Supabase SQL Editor.

### 02_backfill_existing_profit_data.sql
Backfills profit data for all existing invoices in the database.
- Loops through all existing invoices
- Calculates profit for items linked to products (with cost_price)
- Populates the `product_profit_log` table
- Uses `ON CONFLICT DO NOTHING` to safely skip already-processed invoices

**Run this second** after running 01_create_product_profit_tracking.sql.

## How to Apply

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `01_create_product_profit_tracking.sql`
5. Click **Run**
6. Repeat for `02_backfill_existing_profit_data.sql`

## What This Enables

After applying these changes:

1. **Automatic Profit Logging**: Every time an invoice is created via the app, profit data is automatically logged for items that have a `product_id` linked to the products table.

2. **Yearly Summary**: View total product revenue, cost, and net profit per year via the `yearly_product_profit_summary` view.

3. **Monthly Summary**: View monthly breakdowns via the `monthly_product_profit_summary` view.

4. **Product-wise Summary**: See which products are most profitable via the `product_wise_profit_summary` view.

5. **Performance**: The Product Net Profit Analytics page now uses database views for fast loading, with client-side calculation as fallback.

## Database Schema Changes

### New Table: `product_profit_log`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| invoice_id | UUID | Reference to invoices table |
| invoice_number | VARCHAR | Invoice number for display |
| product_id | UUID | Reference to products table |
| product_name | VARCHAR | Product name (cached for display) |
| quantity_sold | INTEGER | Quantity sold in this invoice |
| unit_selling_price | DECIMAL(12,2) | Selling price per unit |
| unit_cost_price | DECIMAL(12,2) | Cost price per unit (from products table) |
| total_revenue | DECIMAL(12,2) | quantity × selling_price |
| total_cost | DECIMAL(12,2) | quantity × cost_price |
| net_profit | DECIMAL(12,2) | total_revenue - total_cost |
| sold_at | TIMESTAMPTZ | When the sale occurred |
| created_at | TIMESTAMPTZ | Record creation time |

### New Views
- `yearly_product_profit_summary` - Aggregated by year
- `monthly_product_profit_summary` - Aggregated by year and month
- `product_wise_profit_summary` - Aggregated by product

### New Function
- `log_invoice_product_profit(invoice_id, invoice_number, items, sold_at)` - Call this after creating an invoice to log profit data automatically.

## Integration with Application

The `createInvoice` function in `src/functions/invoices.ts` has been updated to automatically call the `log_invoice_product_profit` RPC function after successfully creating an invoice.

The Product Net Profit Analytics page (`src/app/(admin)/(main-pages)/sales/product-net/page.tsx`) now:
1. Fetches yearly summary from `yearly_product_profit_summary` view
2. Fetches monthly summaries from `monthly_product_profit_summary` view
3. Falls back to client-side calculation if views are not available
4. Displays data from database views for better performance