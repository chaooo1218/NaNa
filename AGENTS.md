# AGENTS.md

# Restaurant Live Crowd Platform — Enterprise Engineering Rules

This repository is part of a commercial restaurant live crowd monitoring platform.

The product uses non-image people-flow sensing hardware and provides public restaurant crowd information, merchant operations tools, administrative tools, device monitoring, reporting, and future integrations.

This file is mandatory project instruction for all coding agents.

Read this file before inspecting, editing, creating, deleting, moving, or running project files.

---

# 1. Project Identity

## Product

Product category:

* Restaurant live crowd monitoring platform
* Non-image people-flow sensing system
* Public customer-facing restaurant discovery website
* Future merchant management platform
* Future headquarters administration platform
* Future device monitoring and reporting platform

The product must be designed for commercial operation, AWS deployment, maintainability, data protection, operational observability, and future multi-tenant expansion.

This is not a one-off landing page.

This repository must be treated as a production foundation.

---

# 2. Current Repository Scope

The current repository primarily owns:

* Astro public customer website
* Shared public UI components
* React Islands for interactive public features
* Mock API provider
* Public API Adapter Layer
* Frontend types
* Frontend runtime configuration
* Public API contracts
* Device telemetry contracts
* Architecture documentation
* AWS deployment target documentation

The current repository does not own:

* Production database implementation
* Real ESP32 firmware implementation
* Real LD2450 driver implementation
* AWS IoT Core provisioning
* MQTT certificate provisioning
* Actual merchant authentication
* Actual admin authentication
* Payment processing
* Order processing
* Real AWS infrastructure provisioning
* Real deployment credentials
* Real production API implementation

Do not silently introduce these systems into this repository unless the user explicitly requests them.

---

# 3. Product Context

The platform will eventually receive data from restaurant-installed hardware.

Current hardware context:

* Main controller: ESP32-S3 N16R8
* Radar sensor: LD2450
* ESP32-S3 and LD2450 communicate through UART
* Sensor installation is above a restaurant doorway and points downward
* Single-door restaurants may use one hardware module
* Dual-door restaurants may use two hardware modules
* Dual-door restaurant data must be aggregated by the backend, never by the public frontend
* The platform is non-image monitoring
* The platform must not rely on camera, face recognition, biometric recognition, or video storage
* Doorway dwell time may be used to infer waiting count after a configured threshold
* Public site data may refresh every five seconds
* Public frontend must never connect directly to hardware, MQTT, AWS IoT Core, Redis, MySQL, Aurora, internal queues, or private backend services

The public frontend only communicates with approved Public API endpoints.

---

# 4. Core Product Principles

All work must follow these principles.

1. Preserve the current v0 visual direction unless the user explicitly requests redesign.
2. Prefer maintainability over quick hacks.
3. Prefer clear boundaries over hidden coupling.
4. Prefer typed contracts over implicit object shapes.
5. Prefer explicit error states over silently failing UI.
6. Prefer data minimization over collecting or exposing unnecessary data.
7. Prefer backend aggregation over browser-side business logic.
8. Prefer AWS-ready architecture over temporary local-only shortcuts.
9. Prefer static Astro output for public pages when possible.
10. Use React only when interactivity requires it.
11. Never expose internal device, tenant, merchant, admin, database, queue, certificate, or cloud infrastructure information to public users.
12. Never fabricate a real-time metric when data confidence is insufficient.
13. Never interpret traffic count as occupancy unless the backend explicitly provides a validated occupancy estimate.
14. Never allow a sponsored restaurant presentation to mislead users into thinking it is an organic ranking result.
15. All public-facing interface text must be Traditional Chinese.

---

# 5. Architecture Rules

## 5.1 Frontend Architecture

Use the following responsibility model.

```text
Astro Page / Layout
→ Astro Presentation Component
→ React Island only when interaction is required
→ Hook / Controller
→ API Adapter Layer
→ API Client
→ Mock Provider or Production Provider
```

UI components must not:

* Directly import mock data
* Directly call `fetch`
* Directly contain API base URLs
* Directly parse raw backend JSON
* Directly access environment variables except through approved runtime config
* Directly access browser storage without a documented purpose
* Directly implement merchant, admin, device, or cloud authorization logic

Data access must be centralized in `src/lib/api/`.

All API response mapping must happen before data reaches visual components.

---

## 5.2 Astro Rules

Astro is the default rendering layer.

Use Astro for:

* Pages
* Layouts
* Header
* Footer
* Static restaurant card structure
* Static restaurant information
* SEO metadata
* About page
* Privacy page
* Terms page
* Empty state shells
* Error state shells
* Loading skeleton shells
* Static map legend
* Non-interactive content blocks

Use React Islands only for:

* Search input
* Search suggestions
* Filters
* Sorting
* URL Search Params synchronization
* Live crowd refresh controller
* Map interaction
* User geolocation
* Pin click interaction
* Future authentication interaction
* Future favorite interaction
* Future order interaction
* Future notification interaction
* Future dashboard charts

Do not convert the whole site into a client-rendered React application.

Do not use `client:load` by default.

Use the lowest-cost hydration strategy that fulfills the feature requirement.

Prefer:

* `client:visible` for maps and below-the-fold interactive areas
* `client:idle` for non-critical interactive widgets
* `client:load` only for immediately required user interaction
* `client:only` only when SSR is impossible or unsafe

---

## 5.3 Public Site Deployment Target

The target public web architecture is:

```text
Route 53
→ CloudFront
→ AWS WAF
→ S3 Static Astro Build
→ Public API
```

The public website must remain deployable as a static Astro build unless a future approved requirement requires server rendering.

Do not introduce server-only state into public pages without explicit approval.

Do not rely on Vercel, Netlify, a developer laptop, or a personal computer as the production runtime.

---

# 6. Target AWS System Boundaries

The future target system contains separate domains.

```text
Public Customer Website
Merchant Back Office
Admin Back Office
Public API
Merchant API
Admin API
Device Ingestion API
AWS IoT Core MQTT
Reporting and Notification Service
```

These domains must not be mixed.

## 6.1 Public Customer Website

Public website may access only Public API.

Public website may display:

* Restaurant name
* Restaurant category
* Restaurant description
* Restaurant image
* Restaurant location summary
* Restaurant operating status
* Crowd level
* Waiting count when approved
* Estimated waiting time
* Last updated time
* Sponsored status
* Online ordering URL
* Reservation URL
* Public promotion information

Public website must not display:

* device id
* device certificate
* device MAC address
* Wi-Fi RSSI
* raw sensor coordinates
* radar target id
* firmware detail
* internal anomaly detail
* database id
* queue message id
* tenant id
* merchant id
* admin id
* internal API topology
* stack traces
* database errors
* cloud credentials
* internal timestamps not intended for public users

## 6.2 Merchant Back Office

Merchant back office may eventually access:

* Merchant-owned restaurant data
* Restaurant device summaries
* Device online / offline status
* Reports
* Human-flow trends
* Merchant settings
* Marketing campaign summaries
* Future menu, order, reservation, ERP, POS integration boundaries

Merchant back office must never access another merchant’s data.

## 6.3 Admin Back Office

Admin back office may eventually access:

* Tenant management
* Merchant management
* Restaurant management
* Device registry
* Device health
* Support workflows
* Sponsored campaign management
* System-level reporting
* Audit logs

Admin access must be role-based.

Suggested future roles:

* super_admin
* engineer
* support
* operations
* merchant_admin
* merchant_staff

Do not implement actual authorization unless explicitly requested.

## 6.4 Device Ingestion

Device ingestion is not a frontend feature.

Target production direction:

```text
ESP32-S3 + LD2450
→ Wi-Fi + TLS
→ AWS IoT Core MQTT or controlled Device Ingestion API
→ Queue
→ Processing Service
→ Database / Cache
→ Public and Private APIs
```

The frontend must not:

* Connect to MQTT
* Connect to AWS IoT Core
* Handle device certificates
* Store device secrets
* Compute device authorization
* Aggregate multi-door telemetry
* Determine device health
* Trust device-reported restaurant ownership

---

# 7. Data Domain Rules

## 7.1 Restaurant Identity Hierarchy

The target hierarchy is:

```text
Tenant
→ Merchant
→ Restaurant
→ Location
→ Door
→ Device
```

A device belongs to a registered door.

A door belongs to one restaurant location.

A restaurant may have one or more doors.

A restaurant may have one or more devices.

The backend owns this relationship.

The frontend must only consume restaurant-level public aggregates.

---

## 7.2 Crowd Metrics

Do not merge these concepts.

```text
trafficCount
waitingCount
crowdLevel
occupancyEstimate
occupancyConfidence
freshness
```

Definitions:

* `trafficCount`: total flow or crossing-related metric
* `waitingCount`: estimated number of people waiting near the entrance
* `crowdLevel`: qualitative crowd state
* `occupancyEstimate`: estimated in-store count only when backend confidence is sufficient
* `occupancyConfidence`: confidence level of occupancy estimate
* `freshness`: freshness state of the data

Never label `trafficCount` as “店內人數”.

Never display an occupancy value unless the API provides an explicit validated `occupancyEstimate`.

If no reliable occupancy estimate exists, use crowd-level wording such as:

* 人少
* 普通
* 忙碌
* 尖峰
* 暫無即時資料

The default crowd levels are:

```ts
type CrowdLevel =
  | "empty"
  | "low"
  | "moderate"
  | "busy"
  | "peak"
  | "closed"
  | "unknown";
```

The default freshness states are:

```ts
type DataFreshness =
  | "fresh"
  | "delayed"
  | "stale"
  | "unavailable";
```

---

## 7.3 Dual-Door Aggregation

For restaurants with multiple doors:

* Each device uploads independent telemetry.
* Device-to-door mapping is owned by backend Device Registry.
* Aggregation occurs in backend processing service.
* Public API returns restaurant-level aggregate status.
* Public frontend must never merge device events.
* Public frontend must never infer door topology.

---

# 8. API Design Rules

## 8.1 API Adapter Layer

All data access must go through approved adapters.

Expected locations:

```text
src/lib/api/client.ts
src/lib/api/errors.ts
src/lib/api/api-factory.ts
src/lib/api/restaurant-api.ts
src/lib/api/live-status-api.ts
src/lib/api/map-api.ts
src/lib/api/mock/
src/lib/mappers/
src/lib/validation/
```

Required API interface examples:

```ts
getRestaurants(params)
getRestaurantById(id)
getRestaurantBySlug(slug)
getRestaurantLiveStatus(id)
getRestaurantLiveStatuses(ids)
getNearbyRestaurants(latitude, longitude, radius)
getSponsoredRestaurants(params)
getRestaurantMapPins(bounds, filters)
searchRestaurants(keyword, filters)
getRestaurantMenu(id)
```

The UI must never know whether data comes from Mock API or Production API.

Use a provider factory selected by runtime configuration.

---

## 8.2 API Client Requirements

The API client must:

* Use a configured base URL
* Support timeout
* Support `AbortSignal`
* Include request id handling where applicable
* Normalize errors
* Support limited retry only for safe GET requests
* Use exponential backoff for retry
* Avoid automatic retries for non-idempotent operations
* Avoid leaking internal error messages
* Validate or defensively map API responses
* Preserve stale successful data when appropriate
* Distinguish empty data from failed data
* Avoid duplicate requests where practical

Do not implement retry loops inside individual visual components.

---

## 8.3 Live Data Refresh Rules

Live crowd refresh must be centrally managed.

Rules:

1. One page-level controller manages batch updates.
2. Do not create one polling timer per restaurant card.
3. Use `getRestaurantLiveStatuses(ids)` for visible restaurants.
4. Default interval is controlled by `PUBLIC_LIVE_REFRESH_INTERVAL_MS`.
5. Default target interval is 5000 milliseconds.
6. Pause or reduce refresh when the page is hidden.
7. Pause refresh while offline.
8. Abort pending requests on unmount.
9. Use bounded exponential backoff after repeated failure.
10. Preserve prior successful data and mark it stale when necessary.
11. Do not automatically reorder a visible list on every refresh unless explicitly designed and communicated.
12. Do not cause layout jump or scroll instability during updates.

---

## 8.4 Public API Boundaries

Public API paths may include:

```text
GET /v1/public/restaurants
GET /v1/public/restaurants/{id}
GET /v1/public/restaurants/{id}/live
GET /v1/public/restaurants/live-status
GET /v1/public/restaurants/{id}/menu
GET /v1/public/restaurants/nearby
GET /v1/public/restaurants/search
GET /v1/public/map/pins
GET /v1/public/sponsored-restaurants
```

Public API responses must not expose internal infrastructure data.

All future API contracts must be versioned.

Use `/v1/` as the initial contract version path unless the user explicitly changes the convention.

---

# 9. Device Contract Rules

Device contracts belong in:

```text
contracts/proto/v1/
```

Expected files:

```text
device_telemetry.proto
device_commands.proto
```

The device telemetry contract should support at least:

* schema version
* message id
* device id
* sequence number
* sent timestamp
* firmware version
* hardware version
* uptime
* reboot count
* Wi-Fi RSSI
* sensor health
* radar health
* last radar read timestamp
* door id
* door topology
* crossing count delta
* waiting count
* crowd candidate
* calibration version
* anomaly code
* heartbeat
* diagnostic summary

Device messages are untrusted input.

Backend must validate:

* device authorization
* device registration
* schema compatibility
* sequence number
* duplicate messages
* out-of-order messages
* timestamp validity
* clock drift
* replay protection
* payload size
* malformed payload
* device state
* firmware compatibility

Do not expose device telemetry directly to public frontend.

Do not write firmware implementation in this repository unless explicitly requested.

---

# 10. OpenAPI Contract Rules

API contracts belong in:

```text
contracts/openapi/
```

Expected files:

```text
public-api.v1.yaml
merchant-api.v1.yaml
admin-api.v1.yaml
device-ingestion-api.v1.yaml
```

Each endpoint contract must define:

* path
* method
* purpose
* authorization boundary
* path parameters
* query parameters
* request body
* response body
* success status codes
* error status codes
* pagination
* request id
* rate limit behavior
* stale data behavior
* empty data behavior
* schema version
* examples
* privacy constraints

Do not use undocumented ad hoc response shapes.

---

# 11. TypeScript Rules

TypeScript strict mode is mandatory.

Do not:

* Use `any`
* Use untyped JSON
* Use broad `Record<string, unknown>` as a substitute for actual models
* Use unchecked type assertions
* Use non-null assertion `!` unless there is an explicit invariant and a comment
* Silence compiler errors with `@ts-ignore`
* Silence compiler errors with `@ts-nocheck`
* Disable strict mode
* Change compiler rules only to make build pass

Do:

* Define explicit domain types
* Use discriminated unions for API states and error states
* Use `unknown` for external untrusted data
* Validate or map `unknown` before use
* Keep API models separate from UI view models when necessary
* Keep public data models separate from private device or admin models

---

# 12. Environment Variable Rules

Environment variables must be documented in `.env.example`.

Browser-visible variables must use the `PUBLIC_` prefix.

Examples:

```env
PUBLIC_APP_ENV=development
PUBLIC_ENABLE_MOCK_API=true
PUBLIC_API_BASE_URL=
PUBLIC_MAP_PROVIDER=mock
PUBLIC_MAPBOX_TOKEN=
PUBLIC_LIVE_REFRESH_INTERVAL_MS=5000
PUBLIC_ENABLE_ANALYTICS=false
```

Never place the following in frontend code, `.env.example`, documentation examples with real values, or public runtime configuration:

* AWS Access Key
* AWS Secret Access Key
* AWS IoT certificate
* AWS IoT private key
* RDS password
* Redis password
* JWT secret
* Line Channel Secret
* Line Channel Access Token
* device secret
* MQTT password
* private API key
* admin token
* merchant token
* webhook signing secret
* database URL containing credentials

Do not commit `.env`.

Do not expose secrets through `PUBLIC_` variables.

A public Mapbox token may be browser-visible only if it is intentionally restricted for frontend use.

---

# 13. UI and Accessibility Rules

All public user-facing text must be Traditional Chinese.

Code identifiers, type names, API field names, filenames, and documentation architecture terms may use English.

UI requirements:

* Mobile-first responsive layout
* No horizontal overflow at 375px viewport width
* Clear touch targets
* Keyboard navigation support
* Visible focus states
* Semantic HTML
* Meaningful `alt` text for images
* `aria-label` for icon-only buttons
* Clear loading state
* Clear empty state
* Clear error state
* Clear stale-data state
* No raw backend error message in UI
* No fake loading success
* No misleading sponsored ranking
* No accessibility regressions to preserve visual effects

Do not sacrifice readability for animation.

Do not make important status depend only on color.

Crowd badges must contain text labels, not color alone.

---

# 14. Map Architecture Rules

Map implementations must use a provider adapter.

Expected structure:

```text
src/components/map/MapProvider.ts
src/components/map/MockMapProvider.ts
src/components/map/RestaurantMap.tsx
src/components/map/RestaurantPin.tsx
src/components/map/SponsoredRestaurantPin.tsx
```

Do not make the rest of the app depend directly on Mapbox-specific objects.

Map pins must be driven by typed map data.

Map pin categories may include:

* normal
* recommended
* sponsored
* premium_sponsored

Sponsored visual effects must be isolated to presentation components.

Do not embed ad campaign logic into map core logic.

Do not load a real map SDK or require a map token unless the user explicitly approves that phase.

---

# 15. Testing and Quality Rules

Before declaring a task complete, run the applicable checks discovered from the repository.

Typical checks may include:

```text
lint
typecheck
test
test:e2e
build
```

For Astro, use the project’s configured equivalent of:

```text
astro check
astro build
```

Do not pretend a check passed.

Report the exact command and outcome.

If a check fails:

1. Diagnose the cause.
2. Fix only within task scope.
3. Re-run the check.
4. Report remaining issues honestly.

Do not:

* Disable lint rules to hide errors
* Skip failing tests without explanation
* Add broad ignore patterns
* Remove tests to make CI green
* Change snapshot expectations without understanding the impact
* Suppress accessibility warnings without justification

When adding new behavior, prefer adding appropriate tests.

At minimum, behavior requiring tests includes:

* API mapping
* Crowd status presentation mapping
* Search parameter parsing
* Filter and sorting behavior
* Stale data behavior
* API error behavior
* Dual-door aggregation boundary documentation
* Device data privacy boundary

---

# 16. Dependency Rules

Before adding any dependency:

1. Inspect existing dependencies.
2. Reuse existing project capability when reasonable.
3. Confirm the package is necessary.
4. Avoid duplicate libraries with overlapping responsibilities.
5. Avoid introducing heavy packages for minor utility tasks.
6. Preserve the existing package manager.
7. Update lock file only through the existing package manager.
8. Document why a new dependency was added.

Do not add:

* Supabase
* Firebase
* AWS SDK
* Mapbox SDK
* Auth provider SDK
* Payment SDK
* Global state library
* Query library
* Analytics SDK

unless the user explicitly requests it or the active task cannot be completed without it.

---

# 17. Git and Change Safety Rules

Before editing:

```text
git status
```

Always preserve user work.

Never run:

```text
git reset --hard
git clean -fd
git push --force
git checkout -- .
```

Do not:

* Delete untracked files
* Rewrite history
* Force push
* Commit automatically
* Push automatically
* Change branches automatically
* Replace the project wholesale
* Delete existing UI before verified replacement exists

If a structural migration is needed:

* Make the smallest coherent change.
* Keep the app buildable where possible.
* Report modified files.
* Report migration risk.
* Report rollback path.

---

# 18. Documentation Rules

Keep these documents current when relevant:

```text
README.md
docs/architecture.md
docs/api-contract.md
docs/device-data-contract.md
docs/aws-deployment-target.md
docs/adr/
contracts/openapi/
contracts/proto/
```

Architecture documents must explain:

* public website
* merchant system
* admin system
* device ingestion
* data flow
* AWS target deployment
* privacy boundary
* authorization boundary
* dual-door aggregation
* live data freshness
* failure handling
* observability boundary

Do not let documentation drift from implemented architecture.

---

# 19. Required Workflow for Complex Tasks

For any multi-file or architecture-changing task:

1. Read `AGENTS.md`.
2. Inspect current repository structure.
3. Check Git status.
4. Identify affected files.
5. State implementation plan.
6. Make the smallest coherent implementation.
7. Run quality checks.
8. Report exact results.
9. Report known limitations.
10. Do not start unrelated follow-up work.

For tasks involving API, device, AWS, maps, authentication, payment, analytics, or deployment:

* Identify trust boundaries first.
* Identify secrets first.
* Identify public versus private data first.
* Identify mock versus production behavior first.
* Identify rollback path first.

---

# 20. Completion Report Format

When completing a task, report using this structure.

```text
1. Summary
2. Files changed
3. Architecture impact
4. API / device / AWS impact
5. Validation commands and results
6. Known limitations
7. Risks
8. Recommended next step
```

Do not claim production readiness unless all relevant production requirements, security controls, observability, testing, deployment validation, and operational requirements are actually implemented and verified.

---

# 21. Explicit Prohibitions

Never:

* Connect browser directly to ESP32-S3
* Connect browser directly to LD2450
* Connect browser directly to MQTT
* Connect browser directly to AWS IoT Core
* Expose device certificates
* Expose device secrets
* Expose database credentials
* Expose merchant or admin tokens
* Put business-critical logic only in frontend
* Aggregate multi-door data in frontend
* Treat radar target count as guaranteed occupancy
* Use camera or biometric data
* Store raw radar data in public UI
* Use `any`
* Disable TypeScript strict mode
* Hardcode production API URLs in components
* Import mock data in UI components
* Make one polling timer per card
* Build an entire client-side React SPA when Astro can render the page
* Deploy without explicit user instruction
* Push without explicit user instruction
* Delete existing work to simplify a migration
* Hide errors instead of handling them
* Invent an API response shape without documenting it

---

# 22. Priority Order When Requirements Conflict

Use this priority order:

1. Security and privacy
2. Data correctness
3. Preservation of user work
4. Commercial maintainability
5. Clear architecture boundaries
6. Production deployment readiness
7. Type safety
8. Accessibility
9. Performance
10. Visual fidelity
11. Development convenience

When uncertain, choose the safer and more maintainable option and explain the assumption in the completion report.

---

## Local Secrets and Credential Handling

Never read, print, modify, stage, commit, upload, copy, or search for real secrets.

Treat the following paths and file types as restricted local-only material:

* `.env`
* `.env.local`
* `.env.*.local`
* `secrets/`
* `local-secrets/`
* `*.pem`
* `*.key`
* `*.p8`
* `*.p12`
* `*.pfx`
* AWS credential files
* Device certificates
* Private API key files
* Any file located outside this repository in the user’s local secret directory

Only `.env.example` may be read or modified inside this repository.

Do not ask the user to paste secrets into chat, source code, documentation, terminal output, commit messages, or issue descriptions.

Never run:

```text
git add -A
git add .
git commit -a
git push
```

unless the user explicitly requests the exact operation.

When staging files, use an explicit allowlist of file paths.

Before any commit, inspect:

```text
git diff --cached --name-only
git diff --cached --check
```

Do not stage any environment file other than `.env.example`.

Do not place real credentials in frontend code, public runtime configuration, `PUBLIC_` variables, mock data, test fixtures, documentation examples, or generated files.

For production AWS deployment, private credentials must be provided through AWS Secrets Manager, CI/CD secret storage, or approved server-side environment configuration. They must never be shipped to the browser.
