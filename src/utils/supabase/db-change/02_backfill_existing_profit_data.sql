-- Backfill Existing Invoice Data into Product Profit Log
-- Run this AFTER creating the product_profit_log table and function
-- This will populate profit data for all existing invoices
-- Note: products.id is BIGINT

-- Backfill profit data for all existing invoices
DO $$
DECLARE
    inv_record RECORD;
    item_record JSONB;
    v_product_id BIGINT;
    v_product_name VARCHAR;
    v_quantity INTEGER;
    v_unit_selling_price DECIMAL(12,2);
    v_unit_cost_price DECIMAL(12,2);
    v_total_revenue DECIMAL(12,2);
    v_total_cost DECIMAL(12,2);
    v_net_profit DECIMAL(12,2);
BEGIN
    -- Loop through all invoices
    FOR inv_record IN 
        SELECT id, invoice_number, items, created_at
        FROM public.invoices
        WHERE items IS NOT NULL
        ORDER BY created_at
    LOOP
        -- Loop through each item in the invoice
        FOR item_record IN SELECT * FROM jsonb_array_elements(inv_record.items)
        LOOP
            -- Extract item data
            v_product_id := (item_record ->> 'product_id')::BIGINT;
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
                    
                    -- Insert into profit log (ignore conflicts if already exists)
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
                        inv_record.id,
                        inv_record.invoice_number,
                        v_product_id,
                        v_product_name,
                        v_quantity,
                        v_unit_selling_price,
                        v_unit_cost_price,
                        v_total_revenue,
                        v_total_cost,
                        v_net_profit,
                        inv_record.created_at
                    )
                    ON CONFLICT DO NOTHING; -- Skip if already exists
                END IF;
            END IF;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Backfill completed successfully';
END;
$$;

-- Verify the backfill
SELECT 
    'Total profit log entries' as metric,
    COUNT(*)::TEXT as value
FROM public.product_profit_log
UNION ALL
SELECT 
    'Total net profit' as metric,
    SUM(net_profit)::TEXT as value
FROM public.product_profit_log
UNION ALL
SELECT 
    'Total revenue' as metric,
    SUM(total_revenue)::TEXT as value
FROM public.product_profit_log
UNION ALL
SELECT 
    'Total cost' as metric,
    SUM(total_cost)::TEXT as value
FROM public.product_profit_log;