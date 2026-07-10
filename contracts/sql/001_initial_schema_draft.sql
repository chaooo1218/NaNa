-- Draft only. Do not run in production.
-- This SQL is for architecture review and future migration planning.
-- No database connection, migration runner, seed, or deployment is created by this file.

CREATE TYPE restaurant_status AS ENUM ('open', 'closed', 'unknown');
CREATE TYPE crowd_level AS ENUM ('empty', 'low', 'moderate', 'busy', 'peak', 'closed', 'unknown');
CREATE TYPE data_freshness AS ENUM ('fresh', 'delayed', 'stale', 'unavailable');
CREATE TYPE menu_availability_status AS ENUM ('available', 'sold_out', 'hidden');
CREATE TYPE device_status AS ENUM ('provisioned', 'active', 'offline', 'maintenance', 'retired', 'unknown');
CREATE TYPE assignment_status AS ENUM ('active', 'inactive', 'replaced');
CREATE TYPE door_topology AS ENUM ('single', 'dual_non_overlap', 'dual_overlap');
CREATE TYPE crossing_direction AS ENUM ('entry', 'exit');
CREATE TYPE calibration_status AS ENUM ('draft', 'active', 'superseded', 'invalid');

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

CREATE TABLE doors (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  restaurant_id uuid NOT NULL,
  public_label varchar(120) NOT NULL,
  topology door_topology NOT NULL DEFAULT 'single',
  direction_convention varchar(80) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (restaurant_id, tenant_id) REFERENCES restaurants(id, tenant_id),
  UNIQUE (id, tenant_id),
  UNIQUE (restaurant_id, public_label)
);

CREATE TABLE door_sensor_assignments (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  door_id uuid NOT NULL,
  device_id uuid NOT NULL,
  assignment_status assignment_status NOT NULL DEFAULT 'active',
  coverage_segment varchar(120) NOT NULL,
  overlap_policy varchar(80) NOT NULL DEFAULT 'none',
  priority smallint NOT NULL DEFAULT 0 CHECK (priority >= 0),
  configuration_version varchar(80) NOT NULL,
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  FOREIGN KEY (door_id, tenant_id) REFERENCES doors(id, tenant_id),
  FOREIGN KEY (device_id, tenant_id) REFERENCES devices(id, tenant_id),
  CHECK (valid_to IS NULL OR valid_to > valid_from),
  UNIQUE (door_id, device_id, configuration_version)
);

CREATE TABLE device_calibrations (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  device_id uuid NOT NULL,
  door_id uuid NOT NULL,
  calibration_version varchar(80) NOT NULL,
  mount_height_mm integer NOT NULL CHECK (mount_height_mm > 0),
  mount_pitch_degrees numeric(7, 3) NOT NULL,
  mount_yaw_degrees numeric(7, 3) NOT NULL,
  mount_roll_degrees numeric(7, 3) NOT NULL,
  sensor_to_door_transform jsonb NOT NULL,
  door_line_start_x_mm integer NOT NULL,
  door_line_start_y_mm integer NOT NULL,
  door_line_end_x_mm integer NOT NULL,
  door_line_end_y_mm integer NOT NULL,
  inside_zone_config jsonb NOT NULL,
  outside_zone_config jsonb NOT NULL,
  buffer_zone_config jsonb NOT NULL,
  hysteresis_width_mm integer NOT NULL CHECK (hysteresis_width_mm >= 0),
  direction_sign smallint NOT NULL CHECK (direction_sign IN (-1, 1)),
  config_checksum char(64) NOT NULL,
  status calibration_status NOT NULL DEFAULT 'draft',
  calibrated_at timestamptz NOT NULL,
  activated_at timestamptz,
  superseded_at timestamptz,
  calibrated_by_audit_reference varchar(200) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (device_id, tenant_id) REFERENCES devices(id, tenant_id),
  FOREIGN KEY (door_id, tenant_id) REFERENCES doors(id, tenant_id),
  UNIQUE (device_id, calibration_version),
  UNIQUE (device_id, config_checksum),
  CHECK (activated_at IS NULL OR activated_at >= calibrated_at),
  CHECK (superseded_at IS NULL OR activated_at IS NOT NULL),
  CHECK (superseded_at IS NULL OR superseded_at >= activated_at)
);

CREATE TABLE device_count_windows (
  id uuid PRIMARY KEY,
  message_id uuid NOT NULL UNIQUE,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  device_id uuid NOT NULL,
  door_id uuid NOT NULL,
  boot_id varchar(100) NOT NULL,
  sequence_number bigint NOT NULL CHECK (sequence_number >= 0),
  schema_version varchar(40) NOT NULL,
  calibration_version varchar(80) NOT NULL,
  window_start timestamptz NOT NULL,
  window_end timestamptz NOT NULL,
  entry_delta integer NOT NULL CHECK (entry_delta >= 0),
  exit_delta integer NOT NULL CHECK (exit_delta >= 0),
  local_occupancy_candidate integer,
  waiting_count_candidate integer CHECK (waiting_count_candidate >= 0),
  target_count_peak integer NOT NULL CHECK (target_count_peak >= 0),
  capacity_saturated boolean NOT NULL DEFAULT false,
  radar_frame_count integer NOT NULL CHECK (radar_frame_count >= 0),
  dropped_frame_count integer NOT NULL CHECK (dropped_frame_count >= 0),
  quality_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  firmware_version varchar(80) NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (device_id, tenant_id) REFERENCES devices(id, tenant_id),
  FOREIGN KEY (door_id, tenant_id) REFERENCES doors(id, tenant_id),
  UNIQUE (device_id, boot_id, sequence_number),
  CHECK (window_end > window_start),
  CHECK (jsonb_typeof(quality_flags) = 'array')
);

CREATE TABLE door_crossing_events (
  event_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  restaurant_id uuid NOT NULL,
  door_id uuid NOT NULL,
  source_device_id uuid NOT NULL,
  boot_id varchar(100) NOT NULL,
  sequence_reference bigint NOT NULL CHECK (sequence_reference >= 0),
  occurred_at timestamptz NOT NULL,
  direction crossing_direction NOT NULL,
  confidence numeric(4, 3) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  capacity_saturated boolean NOT NULL DEFAULT false,
  quality_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  calibration_version varchar(80) NOT NULL,
  dedup_key varchar(200) NOT NULL,
  dedup_status varchar(40) NOT NULL DEFAULT 'pending'
    CHECK (dedup_status IN ('pending', 'unique', 'duplicate', 'uncertain')),
  dedup_decision_summary varchar(300),
  aggregation_status varchar(40) NOT NULL DEFAULT 'pending'
    CHECK (aggregation_status IN ('pending', 'applied', 'rejected', 'held')),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (restaurant_id, tenant_id) REFERENCES restaurants(id, tenant_id),
  FOREIGN KEY (door_id, tenant_id) REFERENCES doors(id, tenant_id),
  FOREIGN KEY (source_device_id, tenant_id) REFERENCES devices(id, tenant_id),
  UNIQUE (restaurant_id, dedup_key),
  CHECK (jsonb_typeof(quality_flags) = 'array')
);

CREATE TABLE restaurant_occupancy_snapshots (
  restaurant_id uuid PRIMARY KEY REFERENCES restaurants(id),
  raw_occupancy integer NOT NULL,
  display_occupancy integer CHECK (display_occupancy >= 0),
  confidence numeric(4, 3) CHECK (confidence BETWEEN 0 AND 1),
  freshness data_freshness NOT NULL DEFAULT 'unavailable',
  last_trusted_at timestamptz,
  last_entry_event_at timestamptz,
  last_exit_event_at timestamptz,
  quality_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  calculated_at timestamptz NOT NULL,
  version bigint NOT NULL CHECK (version > 0),
  CHECK (jsonb_typeof(quality_flags) = 'array')
);

CREATE TABLE occupancy_adjustments (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  restaurant_id uuid NOT NULL,
  adjustment_delta integer,
  corrected_value integer,
  reason_code varchar(80) NOT NULL,
  operator_type varchar(40) NOT NULL CHECK (operator_type IN ('merchant_user', 'admin', 'system')),
  operator_internal_id uuid,
  previous_value integer NOT NULL,
  resulting_value integer NOT NULL,
  occurred_at timestamptz NOT NULL,
  audit_reference varchar(200) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (restaurant_id, tenant_id) REFERENCES restaurants(id, tenant_id),
  CHECK ((adjustment_delta IS NULL) <> (corrected_value IS NULL))
);

CREATE TABLE device_quality_incidents (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  device_id uuid,
  door_id uuid,
  restaurant_id uuid,
  incident_code varchar(80) NOT NULL CHECK (incident_code IN (
    'TARGET_CAPACITY_SATURATED',
    'COUNT_MAY_BE_UNDERESTIMATED',
    'RADAR_FRAME_LOSS',
    'TRACK_ASSOCIATION_UNCERTAIN',
    'CALIBRATION_INVALID',
    'CLOCK_UNSYNCED',
    'OFFLINE_GAP',
    'COUNT_UNDERFLOW',
    'MULTI_SENSOR_OVERLAP_UNCERTAIN'
  )),
  severity varchar(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  affected_window_count integer NOT NULL DEFAULT 0 CHECK (affected_window_count >= 0),
  diagnostic_summary varchar(500) NOT NULL,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (device_id, tenant_id) REFERENCES devices(id, tenant_id),
  FOREIGN KEY (door_id, tenant_id) REFERENCES doors(id, tenant_id),
  FOREIGN KEY (restaurant_id, tenant_id) REFERENCES restaurants(id, tenant_id),
  CHECK (device_id IS NOT NULL OR door_id IS NOT NULL OR restaurant_id IS NOT NULL),
  CHECK (ended_at IS NULL OR ended_at >= started_at),
  CHECK (resolved_at IS NULL OR resolved_at >= started_at)
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

CREATE TABLE firmware_releases (
  id uuid PRIMARY KEY,
  semantic_version varchar(80) NOT NULL UNIQUE,
  security_version integer NOT NULL CHECK (security_version >= 0),
  hardware_compatibility jsonb NOT NULL,
  minimum_bootloader_version varchar(80) NOT NULL,
  release_status varchar(40) NOT NULL
    CHECK (release_status IN ('draft', 'approved', 'active', 'withdrawn', 'revoked')),
  release_notes text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  revoked_at timestamptz,
  approval_audit_reference varchar(200)
);

CREATE TABLE firmware_artifacts (
  id uuid PRIMARY KEY,
  release_id uuid NOT NULL REFERENCES firmware_releases(id),
  artifact_type varchar(60) NOT NULL,
  storage_reference varchar(500) NOT NULL,
  sha256 char(64) NOT NULL,
  signature_metadata jsonb,
  size_bytes bigint NOT NULL CHECK (size_bytes > 0),
  is_signed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (release_id, artifact_type, sha256)
);

CREATE TABLE ota_campaigns (
  id uuid PRIMARY KEY,
  release_id uuid NOT NULL REFERENCES firmware_releases(id),
  rollout_strategy varchar(60) NOT NULL,
  cohort jsonb NOT NULL,
  rollout_percentage numeric(5, 2) NOT NULL CHECK (rollout_percentage BETWEEN 0 AND 100),
  status varchar(40) NOT NULL
    CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'withdrawn')),
  pause_or_withdraw_reason varchar(500),
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  paused_at timestamptz,
  completed_at timestamptz
);

CREATE TABLE ota_deployments (
  id uuid PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES ota_campaigns(id),
  device_id uuid NOT NULL REFERENCES devices(id),
  previous_version varchar(80),
  target_version varchar(80) NOT NULL,
  previous_security_version integer CHECK (previous_security_version >= 0),
  target_security_version integer NOT NULL CHECK (target_security_version >= 0),
  state varchar(40) NOT NULL CHECK (state IN (
    'pending', 'offered', 'downloading', 'verifying', 'installing',
    'rebooting', 'succeeded', 'failed', 'paused', 'withdrawn'
  )),
  progress smallint NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  last_error_code varchar(100),
  last_reported_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, device_id)
);

CREATE TABLE ota_device_events (
  id uuid PRIMARY KEY,
  deployment_id uuid NOT NULL REFERENCES ota_deployments(id),
  event_type varchar(80) NOT NULL,
  firmware_version varchar(80),
  progress smallint CHECK (progress BETWEEN 0 AND 100),
  error_code varchar(100),
  occurred_at timestamptz NOT NULL,
  metadata_safe_subset jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
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
CREATE INDEX doors_restaurant_active_idx ON doors (restaurant_id, is_active);
CREATE INDEX door_sensor_assignments_door_status_idx ON door_sensor_assignments (door_id, assignment_status, valid_from DESC);
CREATE INDEX door_sensor_assignments_device_status_idx ON door_sensor_assignments (device_id, assignment_status, valid_from DESC);
CREATE INDEX device_calibrations_door_status_idx ON device_calibrations (door_id, status, activated_at DESC);
CREATE INDEX device_count_windows_device_time_idx ON device_count_windows (device_id, window_start DESC);
CREATE INDEX device_count_windows_door_time_idx ON device_count_windows (door_id, window_start DESC);
CREATE INDEX door_crossing_events_restaurant_time_idx ON door_crossing_events (restaurant_id, occurred_at DESC);
CREATE INDEX door_crossing_events_door_time_idx ON door_crossing_events (door_id, occurred_at DESC);
CREATE INDEX door_crossing_events_aggregation_idx ON door_crossing_events (aggregation_status, occurred_at);
CREATE INDEX occupancy_adjustments_restaurant_time_idx ON occupancy_adjustments (restaurant_id, occurred_at DESC);
CREATE INDEX device_quality_incidents_device_severity_time_idx ON device_quality_incidents (device_id, severity, started_at DESC);
CREATE INDEX device_quality_incidents_restaurant_time_idx ON device_quality_incidents (restaurant_id, started_at DESC);
CREATE INDEX ota_deployments_device_state_idx ON ota_deployments (device_id, state, last_reported_at DESC);
CREATE INDEX ota_deployments_campaign_state_idx ON ota_deployments (campaign_id, state);
CREATE INDEX ota_device_events_deployment_time_idx ON ota_device_events (deployment_id, occurred_at DESC);

-- Deliberately excluded: raw telemetry events, device secrets, credentials, MAC,
-- Wi-Fi RSSI, radar coordinates, payment/order/POS tables, and RLS policies.
-- Signing private keys are also excluded from the repository, database, firmware,
-- artifacts, and CI logs. This draft does not enable Secure Boot or burn eFuses.
