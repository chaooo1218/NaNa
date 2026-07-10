-- Draft only. Do not run in production.
-- This SQL is for architecture review and future migration planning.
-- No database connection, migration runner, seed, or deployment is created by this file.

CREATE TYPE restaurant_status AS ENUM ('open', 'closed', 'unknown');
CREATE TYPE crowd_level AS ENUM ('empty', 'low', 'moderate', 'busy', 'peak', 'closed', 'unknown');
CREATE TYPE data_freshness AS ENUM ('fresh', 'delayed', 'stale', 'unavailable');
CREATE TYPE menu_availability_status AS ENUM ('available', 'sold_out', 'hidden');
CREATE TYPE device_status AS ENUM ('provisioned', 'active', 'offline', 'maintenance', 'retired', 'unknown');
CREATE TYPE assignment_status AS ENUM ('active', 'inactive', 'replaced');

-- UUID values are application-provided in this draft. No extension is enabled here.
CREATE TABLE tenants (
  id uuid PRIMARY KEY,
  slug varchar(100) NOT NULL UNIQUE,
  name varchar(200) NOT NULL,
  status varchar(40) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE merchants (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name varchar(200) NOT NULL,
  status varchar(40) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, tenant_id)
);

CREATE TABLE merchant_users (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  merchant_id uuid NOT NULL,
  auth_subject varchar(200) NOT NULL,
  display_name varchar(200),
  status varchar(40) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (merchant_id, tenant_id) REFERENCES merchants(id, tenant_id),
  UNIQUE (merchant_id, auth_subject)
);

CREATE TABLE restaurants (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  merchant_id uuid NOT NULL,
  public_id uuid NOT NULL UNIQUE,
  status restaurant_status NOT NULL DEFAULT 'unknown',
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  FOREIGN KEY (merchant_id, tenant_id) REFERENCES merchants(id, tenant_id),
  UNIQUE (id, tenant_id)
);

CREATE TABLE restaurant_public_profiles (
  restaurant_id uuid PRIMARY KEY REFERENCES restaurants(id),
  slug varchar(100) NOT NULL UNIQUE,
  name varchar(200) NOT NULL,
  category varchar(50) NOT NULL,
  category_label varchar(100) NOT NULL,
  description text,
  cover_image varchar(500),
  has_online_order boolean NOT NULL DEFAULT false,
  online_order_url varchar(500),
  is_sponsored boolean NOT NULL DEFAULT false,
  sponsor_level varchar(40) NOT NULL DEFAULT 'none',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE restaurant_locations (
  id uuid PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id),
  region_code varchar(80),
  area_code varchar(80),
  area_label varchar(200) NOT NULL,
  public_summary text NOT NULL,
  location_sort_key varchar(200),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id)
);

CREATE TABLE restaurant_business_hours (
  id uuid PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id),
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time time,
  close_time time,
  is_closed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, day_of_week)
);

CREATE TABLE restaurant_tags (
  id uuid PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id),
  tag varchar(100) NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  UNIQUE (restaurant_id, tag)
);

CREATE TABLE restaurant_menu_categories (
  id uuid PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id),
  name varchar(120) NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE restaurant_menu_items (
  id uuid PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES restaurant_menu_categories(id),
  name varchar(200) NOT NULL,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  description text,
  availability menu_availability_status NOT NULL DEFAULT 'available',
  is_recommended boolean NOT NULL DEFAULT false,
  is_popular boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE devices (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  device_public_uid varchar(160) NOT NULL UNIQUE,
  status device_status NOT NULL DEFAULT 'provisioned',
  last_seen_at timestamptz,
  provisioned_at timestamptz,
  retired_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, tenant_id)
);

CREATE TABLE restaurant_device_assignments (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  restaurant_id uuid NOT NULL,
  device_id uuid NOT NULL,
  assignment_status assignment_status NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  replacement_reason varchar(300),
  FOREIGN KEY (restaurant_id, tenant_id) REFERENCES restaurants(id, tenant_id),
  FOREIGN KEY (device_id, tenant_id) REFERENCES devices(id, tenant_id),
  CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE TABLE device_heartbeats (
  id uuid PRIMARY KEY,
  device_id uuid NOT NULL REFERENCES devices(id),
  observed_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  status device_status NOT NULL,
  health_summary varchar(300),
  CHECK (received_at >= observed_at)
);

CREATE TABLE restaurant_live_status_snapshots (
  restaurant_id uuid PRIMARY KEY REFERENCES restaurants(id),
  traffic_count integer CHECK (traffic_count >= 0),
  traffic_window_seconds integer CHECK (traffic_window_seconds > 0),
  waiting_count integer CHECK (waiting_count >= 0),
  estimated_wait_minutes integer CHECK (estimated_wait_minutes >= 0),
  wait_time_confidence numeric(4, 3) CHECK (wait_time_confidence BETWEEN 0 AND 1),
  crowd_level crowd_level NOT NULL DEFAULT 'unknown',
  occupancy_estimate integer CHECK (occupancy_estimate >= 0),
  occupancy_confidence numeric(4, 3) CHECK (occupancy_confidence BETWEEN 0 AND 1),
  freshness data_freshness NOT NULL DEFAULT 'unavailable',
  observed_at timestamptz,
  received_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE restaurant_daily_public_metrics (
  id uuid PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id),
  metric_date date NOT NULL,
  traffic_count_total bigint CHECK (traffic_count_total >= 0),
  estimated_wait_minutes_avg numeric(10, 2) CHECK (estimated_wait_minutes_avg >= 0),
  data_quality_score numeric(4, 3) CHECK (data_quality_score BETWEEN 0 AND 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, metric_date)
);

CREATE TABLE restaurant_hourly_metrics (
  id uuid PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id),
  hour_bucket timestamptz NOT NULL,
  traffic_count_total bigint CHECK (traffic_count_total >= 0),
  estimated_wait_minutes_avg numeric(10, 2) CHECK (estimated_wait_minutes_avg >= 0),
  data_quality_score numeric(4, 3) CHECK (data_quality_score BETWEEN 0 AND 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, hour_bucket)
);

CREATE TABLE public_api_request_logs (
  id uuid PRIMARY KEY,
  request_id varchar(100) NOT NULL,
  route varchar(200) NOT NULL,
  response_status integer NOT NULL,
  restaurant_id uuid REFERENCES restaurants(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE admin_audit_logs (
  id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants(id),
  actor_reference varchar(200),
  action varchar(120) NOT NULL,
  target_type varchar(120),
  target_reference varchar(200),
  metadata_redacted jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE merchant_audit_logs (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  merchant_id uuid NOT NULL,
  actor_reference varchar(200),
  action varchar(120) NOT NULL,
  target_type varchar(120),
  target_reference varchar(200),
  metadata_redacted jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (merchant_id, tenant_id) REFERENCES merchants(id, tenant_id)
);

-- Query-driven indexes. Validate with production-like data and EXPLAIN before adoption.
CREATE INDEX merchants_tenant_id_idx ON merchants (tenant_id);
CREATE INDEX restaurants_public_list_idx ON restaurants (is_public, status, id);
CREATE INDEX restaurant_locations_area_idx ON restaurant_locations (region_code, area_code, restaurant_id);
CREATE INDEX restaurant_tags_restaurant_order_idx ON restaurant_tags (restaurant_id, display_order);
CREATE INDEX restaurant_menu_categories_restaurant_order_idx ON restaurant_menu_categories (restaurant_id, display_order);
CREATE INDEX restaurant_menu_items_category_order_idx ON restaurant_menu_items (category_id, display_order);
CREATE INDEX restaurant_live_status_freshness_idx ON restaurant_live_status_snapshots (freshness, observed_at DESC);
CREATE INDEX restaurant_live_status_received_idx ON restaurant_live_status_snapshots (received_at DESC);
CREATE INDEX device_status_last_seen_idx ON devices (status, last_seen_at DESC);
CREATE INDEX device_heartbeats_device_observed_idx ON device_heartbeats (device_id, observed_at DESC);
CREATE INDEX restaurant_daily_metrics_lookup_idx ON restaurant_daily_public_metrics (restaurant_id, metric_date DESC);
CREATE INDEX restaurant_hourly_metrics_lookup_idx ON restaurant_hourly_metrics (restaurant_id, hour_bucket DESC);
CREATE INDEX public_api_request_logs_request_idx ON public_api_request_logs (request_id, created_at DESC);
CREATE INDEX admin_audit_logs_scope_idx ON admin_audit_logs (tenant_id, actor_reference, created_at DESC);
CREATE INDEX merchant_audit_logs_scope_idx ON merchant_audit_logs (merchant_id, actor_reference, created_at DESC);

-- Deliberately excluded: raw telemetry events, device secrets, credentials, MAC,
-- Wi-Fi RSSI, radar coordinates, payment/order/POS tables, and RLS policies.
