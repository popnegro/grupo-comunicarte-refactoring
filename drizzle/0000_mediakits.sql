CREATE TABLE IF NOT EXISTS mediakits (
  id SERIAL PRIMARY KEY,
  kit_id TEXT NOT NULL UNIQUE,
  source_request_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_company TEXT,
  client_phone TEXT,
  support_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  approved_prices JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_amount NUMERIC,
  currency TEXT NOT NULL DEFAULT 'ARS',
  notes TEXT,
  metadata JSONB,
  pdf_url TEXT,
  ppt_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mediakit_items (
  id SERIAL PRIMARY KEY,
  kit_id TEXT NOT NULL,
  support_id TEXT NOT NULL,
  approved_price NUMERIC,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mediakits_status ON mediakits(status);
CREATE INDEX IF NOT EXISTS idx_mediakits_source_request ON mediakits(source_request_id);
CREATE INDEX IF NOT EXISTS idx_mediakit_items_kit_id ON mediakit_items(kit_id);
