-- Product Profit Tracking Database Changes
-- Run this in your Supabase SQL Editor

-- 1. Create product_profit_log table to track profit per invoice item
CREATE TABLE IF NOT EXISTS public.product_profit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity_sold INTEGER NOT NULL,
    unit_selling_price DECIMAL(12,2) NOT NULL,
    unit_cost_price DECIMAL(12,2) NOT NULL,
    total_revenue DECIMAL(12,2) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    net_profit DECIMAL(12,2) NOT NULL,
    sold_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on product_profit_log
ALTER TABLE public.product_profit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (adjust as needed for production)
CREATE POLICY "Allow all operations on product_profit_log"
ON public.product_profit_log FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

-- 2. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_profit_log_invoice_id ON public.product_profit_log(invoice_id);
CREATE INDEX IF NOT EXISTS idx_product_profit_log_product_id ON public.product_profit_log(product_id);
CREATE INDEX IF NOT EXISTS idx_product_profit_log_sold_at ON public.product_profit_log(sold_at);

-- 3. Create a view for yearly profit summary
CREATE OR REPLACE VIEW public.yearly_product_profit_summary AS
SELECT 
    EXTRACT(YEAR FROM sold_at)::INTEGER AS year,
    SUM(total_revenue) AS total_product_revenue,
    SUM(total_cost) AS total_product_cost,
    SUM(net_profit) AS total_net_profit,
    COUNT(DISTINCT invoice_id) AS total_invoices,
    COUNT(*) AS total_items_sold
FROM public.product_profit_log
GROUP BY EXTRACT(YEAR FROM sold_at)
ORDER BY year DESC;

-- 4. Create a view for monthly profit summary
CREATE OR REPLACE VIEW public.monthly_product_profit_summary AS
SELECT 
    EXTRACT(YEAR FROM sold_at)::INTEGER AS year,
    EXTRACT(MONTH FROM sold_at)::INTEGER AS month,
    TO_CHAR(sold_at, 'Month') AS month_name,
    SUM(total_revenue) AS total_product_revenue,
    SUM(total_cost) AS total_product_cost,
    SUM(net_profit) AS total_net_profit,
    COUNT(DISTINCT invoice_id) AS total_invoices,
    COUNT(*) AS total_items_sold
FROM public.product_profit_log
GROUP BY EXTRACT(YEAR FROM sold_at), EXTRACT(MONTH FROM sold_at), TO_CHAR(sold_at, 'Month')
ORDER BY year DESC, month DESC;

-- 5. Create a view for product-wise profit summary
CREATE OR REPLACE VIEW public.product_wise_profit_summary AS
SELECT 
    ppl.product_id,
    ppl.product_name,
    SUM(ppl.quantity_sold) AS total_quantity_sold,
    SUM(ppl.total_revenue) AS total_revenue,
    SUM(ppl.total_cost) AS total_cost,
    SUM(ppl.net_profit) AS total_net_profit,
    AVG(ppl.unit_selling_price) AS avg_selling_price,
    AVG(ppl.unit_cost_price) AS avg_cost_price
FROM public.product_profit_log ppl
GROUP BY ppl.product_id, ppl.product_name
ORDER BY total_net_profit DESC;

-- 6. Create a function to log profit when an invoice is created
CREATE OR REPLACE FUNCTION public.log_invoice_product_profit(
    p_invoice_id UUID,
    p_invoice_number VARCHAR,
    p_items JSONB,
    p_sold_at TIMESTAMPTZ DEFAULT NOW()
) RETURNS VOID AS $$
DECLARE
    item_record JSONB;
    v_product_id UUID;
    v_product_name VARCHAR;
    v_quantity INTEGER;
    v_unit_selling_price DECIMAL(12,2);
    v_unit_cost_price DECIMAL(12,2);
    v_total_revenue DECIMAL(12,2);
    v_total_cost DECIMAL(12,2);
    v_net_profit DECIMAL(12,2);
BEGIN
    -- Loop through each item in the invoice
    FOR item_record IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Extract item data
        v_product_id := (item_record ->> 'product_id')::UUID;
        v_product_name := item_record ->> 'name';
        v_quantity := (item_record ->> 'quantity')::INTEGER;
        v_unit_selling_price := (item_record ->> 'unitPrice')::DECIMAL(12,2);
        
        -- Only process items that have a product_id (linked to products table)
        IF v_product_id IS NOT NULL THEN
            -- Get the cost_price from products table
            SELECT cost_price INTO v_unit_cost_price
            FROM public.products
            WHERE id = v_product_id;
            
            -- Only calculate profit if cost_price is available
            IF v_unit_cost_price IS NOT NULL THEN
                v_total_revenue := v_unit_selling_price * v_quantity;
                v_total_cost := v_unit_cost_price * v_quantity;
                v_net_profit := v_total_revenue - v_total_cost;
                
                -- Insert into profit log
                INSERT INTO public.product_profit_log (
                    invoice_id,
                    invoice_number,
                    product_id,
                    product_name,
                    quantity_sold,
                    unit_selling_price,
                    unit_cost_price,
                    total_revenue,
                    total_cost,
                    net_profit,
                    sold_at
                ) VALUES (
                    p_invoice_id,
                    p_invoice_number,
                    v_product_id,
                    v_product_name,
                    v_quantity,
                    v_unit_selling_price,
                    v_unit_cost_price,
                    v_total_revenue,
                    v_total_cost,
                    v_net_profit,
                    p_sold_at
                );
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.log_invoice_product_profit(UUID, VARCHAR, JSONB, TIMESTAMPTZ) TO anon, authenticated;