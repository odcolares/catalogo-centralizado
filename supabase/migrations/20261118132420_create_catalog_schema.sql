-- Catalog Schema Migration
-- Creates tables for product catalog management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '📦',
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Products table (master catalog)
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES categories(id),
    
    -- Commercial
    cost NUMERIC(10,2) NOT NULL DEFAULT 0,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    price_max NUMERIC(10,2),
    margin_target NUMERIC(5,2) DEFAULT 30,
    
    -- Display
    highlights JSONB NOT NULL DEFAULT '[]',
    tags JSONB NOT NULL DEFAULT '[]',
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    
    -- Stock (basic availability)
    qty_on_hand INTEGER NOT NULL DEFAULT 0,
    track_stock BOOLEAN NOT NULL DEFAULT true,
    reorder_point INTEGER DEFAULT 5,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active','inactive','draft','discontinued')),
    visible_to_client BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by TEXT NOT NULL DEFAULT 'lojista'
);

-- Suppliers table
CREATE TABLE suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    phone TEXT,
    lead_time_days INTEGER DEFAULT 7,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Product-Supplier junction (many-to-many)
CREATE TABLE product_suppliers (
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_sku TEXT,
    cost NUMERIC(10,2) NOT NULL,
    lead_time_days INTEGER DEFAULT 7,
    min_order_qty INTEGER DEFAULT 1,
    is_preferred BOOLEAN DEFAULT false,
    PRIMARY KEY (product_id, supplier_id)
);

-- Stock Movements (for inventory control - Option 1)
CREATE TABLE stock_movements (
    id BIGSERIAL PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('in','out','adjustment','transfer','return','loss')),
    subtype TEXT CHECK (subtype IN ('purchase','sale','count','correction','damage','expired','transfer_in','transfer_out')),
    qty INTEGER NOT NULL,
    unit_cost NUMERIC(10,2),
    reference_doc TEXT,
    reference_id TEXT,
    batch_number TEXT,
    expiry_date DATE,
    from_location_id TEXT,
    to_location_id TEXT,
    reason_code TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status) WHERE visible_to_client = true;
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id, created_at DESC);
CREATE INDEX idx_stock_movements_type ON stock_movements(type);
CREATE INDEX idx_product_suppliers_supplier ON product_suppliers(supplier_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Public read access for active categories (client catalog)
CREATE POLICY "Public read active categories" ON categories
    FOR SELECT USING (active = true);

-- Public read access for active products visible to client
CREATE POLICY "Public read active products" ON products
    FOR SELECT USING (status = 'active' AND visible_to_client = true);

-- Authenticated (lojista) full access to categories
CREATE POLICY "Lojista full access categories" ON categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Authenticated (lojista) full access to products
CREATE POLICY "Lojista full access products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- Authenticated (lojista) full access to suppliers
CREATE POLICY "Lojista full access suppliers" ON suppliers
    FOR ALL USING (auth.role() = 'authenticated');

-- Authenticated (lojista) full access to product_suppliers
CREATE POLICY "Lojista full access product_suppliers" ON product_suppliers
    FOR ALL USING (auth.role() = 'authenticated');

-- Authenticated (lojista) full access to stock_movements
CREATE POLICY "Lojista full access stock_movements" ON stock_movements
    FOR ALL USING (auth.role() = 'authenticated');

-- Service role bypasses all RLS (for server.cjs with SERVICE_ROLE_KEY)
-- No additional policies needed for service role
