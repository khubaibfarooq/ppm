# 🛢️ PETROLEUM STATION MANAGEMENT SYSTEM
## Complete Laravel 12 + React + Inertia.js (Velzon Template) Development Prompt

### Core Capabilities
- Multi-station, multi-shift operations management
- Staff & HR with shift assignments and attendance
- Tank management with dip chart calibration (mm → liters interpolation)
- Dispensing machines & nozzle meter readings
- Product management (fuel/lubricants) with full price history
- **Complete double-entry accounting system** (GL, AR, AP, P&L, Balance Sheet)
- Automated journal posting on every business event
- Shift-based sales reconciliation (meter readings vs dip readings)
- Role-based access control (6 roles, granular permissions)
- PDF & Excel export for all reports
- REST API for future mobile app (Sanctum)

---

## 2. TECH STACK

This project uses the **Velzon React + Inertia.js + Laravel** admin template. When generating views and components, ensure they strictly adhere to this stack:

```
Backend Framework:  Laravel 12 (PHP 8.2+)
Frontend:           React + Bootstrap 5 + SCSS + TypeScript
SPA Bridge:         Inertia.js v1 (@inertiajs/react)
Styling:            Bootstrap 5 + SCSS (Velzon customized theme)
Component Library:  react-bootstrap (Container, Row, Col, Card, Modal, Form, Button, Table, etc.)
Icons:              Remix Icons (ri-* class prefix), Feather Icons, Font Awesome
State Management:   Redux Toolkit (@reduxjs/toolkit) + Inertia shared page data
Forms & Submissions:Inertia.js useForm hook
Tables:             HTML Table with Bootstrap classes, or Velzon TableContainer
Charts:             ApexCharts (react-apexcharts)
Auth:               Laravel Breeze (customized with Velzon layouts)
Reporting:          Laravel Excel (Maatwebsite) + barryvdh/laravel-dompdf
Queue:              Redis + Laravel Horizon
Testing (BE):       Pest PHP
Testing (FE):       Vitest + React Testing Library
API (mobile):       Laravel Sanctum
```

---

## 3. PROJECT STRUCTURE & SCAFFOLDING

The project is built on the Velzon Laravel Inertia React template. Do not install Tailwind or shadcn. Create new views, components, and controllers using the existing structure and libraries.

### 3.1 Folder Structure

Make sure to place new files in their respective directories within the existing structure:

```
petro-station/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── StationController.php
│   │   │   ├── StaffController.php
│   │   │   ├── ShiftController.php
│   │   │   ├── TankController.php
│   │   │   ├── MachineController.php
│   │   │   ├── ProductController.php
│   │   │   ├── ShiftLogController.php
│   │   │   ├── MeterReadingController.php
│   │   │   ├── DipReadingController.php
│   │   │   ├── TankDeliveryController.php
│   │   │   ├── AccountingController.php
│   │   │   ├── JournalController.php
│   │   │   ├── CustomerController.php
│   │   │   ├── SupplierController.php
│   │   │   └── ReportController.php
│   │   ├── Middleware/
│   │   │   └── EnsureStationAccess.php
│   │   └── Requests/          # FormRequests per module
│   ├── Models/
│   │   ├── Station.php
│   │   ├── User.php
│   │   ├── Shift.php
│   │   ├── ShiftLog.php
│   │   ├── Tank.php
│   │   ├── DipReading.php
│   │   └── ...
│   ├── Services/
│   │   ├── AccountingService.php
│   │   ├── DipChartService.php
│   │   ├── ShiftClosingService.php
│   │   └── StockReconciliationService.php
│   ├── Enums/
│   └── Actions/
│
├── resources/
│   ├── js/
│   │   ├── Components/        # Reusable React components
│   │   │   ├── Common/        # Velzon common components (BreadCrumb, DeleteModal, etc.)
│   │   ├── Layouts/           # Layout components (Layout wrapper, Header, Sidebar, Footer)
│   │   │   └── index.tsx      # Main layout component
│   │   ├── Pages/             # Inertia page components
│   │   │   ├── Dashboard/
│   │   │   ├── Shifts/
│   │   │   ├── Tanks/
│   │   │   ├── Machines/
│   │   │   ├── Products/
│   │   │   ├── Staff/
│   │   │   ├── Accounting/
│   │   │   ├── Customers/
│   │   │   ├── Suppliers/
│   │   │   └── Reports/
│   │   ├── slices/            # Redux Toolkit layout & state slices
│   │   ├── common/            # Custom common utilities and mock data
│   │   └── types/
│   │       └── index.d.ts     # TypeScript interfaces
```

---

## 4. TYPESCRIPT TYPES

Define all types in `resources/js/types/index.d.ts`:

```typescript
// ─── Core ───────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  employee_code: string;
  phone: string;
  cnic: string;
  designation: string;
  basic_salary: number;
  join_date: string;
  status: 'active' | 'inactive' | 'terminated';
  roles: Role[];
  permissions: string[];
  station: Station;
}

export interface Station {
  id: number;
  name: string;
  address: string;
  phone: string;
  license_number: string;
  is_active: boolean;
}

// ─── Shifts ──────────────────────────────────────────────────
export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

export interface ShiftLog {
  id: number;
  shift: Shift;
  date: string;
  status: 'open' | 'closed' | 'verified';
  opened_at: string;
  closed_at: string | null;
  total_liters_sold: number;
  total_revenue: number;
  total_cash: number;
  short_excess: number;
  opened_by: User;
  closed_by: User | null;
}

// ─── Tanks ───────────────────────────────────────────────────
export interface Tank {
  id: number;
  name: string;
  product: Product;
  capacity_liters: number;
  current_liters: number;
  low_level_alert: number;
  fill_percentage: number; // computed
  is_active: boolean;
}

export interface DipReading {
  id: number;
  tank: Tank;
  shift_log: ShiftLog;
  reading_type: 'opening' | 'closing';
  dip_mm: number;
  liters_from_chart: number;
  water_dip_mm: number;
  recorded_at: string;
}

// ─── Machines ────────────────────────────────────────────────
export interface Machine {
  id: number;
  name: string;
  serial_number: string;
  brand: string;
  is_active: boolean;
  nozzles: Nozzle[];
}

export interface Nozzle {
  id: number;
  machine: Machine;
  tank: Tank;
  product: Product;
  label: string;
  is_active: boolean;
}

export interface MeterReading {
  id: number;
  nozzle: Nozzle;
  shift_log: ShiftLog;
  reading_type: 'opening' | 'closing';
  reading_value: number;
  recorded_at: string;
}

// ─── Products ────────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  code: string;
  unit: string;
  type: 'fuel' | 'lubricant' | 'other';
  current_price: number;
  current_cost: number;
  is_active: boolean;
}

// ─── Sales ───────────────────────────────────────────────────
export interface ShiftSale {
  id: number;
  nozzle: Nozzle;
  product: Product;
  opening_reading: number;
  closing_reading: number;
  liters_sold: number;
  sale_price: number;
  gross_amount: number;
}

// ─── Accounting ──────────────────────────────────────────────
export interface Account {
  id: number;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  sub_type: string;
  normal_balance: 'debit' | 'credit';
  parent_id: number | null;
  children?: Account[];
  balance?: number;
  is_active: boolean;
}

export interface Journal {
  id: number;
  journal_number: string;
  type: string;
  date: string;
  narration: string;
  total_debit: number;
  total_credit: number;
  is_posted: boolean;
  entries: JournalEntry[];
  created_by: User;
}

export interface JournalEntry {
  id: number;
  account: Account;
  debit: number;
  credit: number;
  description: string;
}

// ─── Inertia Page Props ──────────────────────────────────────
export interface PageProps {
  auth: { user: User };
  flash: { success?: string; error?: string };
  station: Station;
  [key: string]: unknown;
}
```

---

## 5. DATABASE MIGRATIONS

Generate migrations in this order:

```bash
php artisan make:migration create_stations_table
php artisan make:migration add_station_fields_to_users_table
php artisan make:migration create_shifts_table
php artisan make:migration create_shift_assignments_table
php artisan make:migration create_products_table
php artisan make:migration create_product_price_history_table
php artisan make:migration create_tanks_table
php artisan make:migration create_tank_dip_chart_table
php artisan make:migration create_tank_dip_readings_table
php artisan make:migration create_tank_deliveries_table
php artisan make:migration create_machines_table
php artisan make:migration create_nozzles_table
php artisan make:migration create_shift_logs_table
php artisan make:migration create_meter_readings_table
php artisan make:migration create_shift_sales_table
php artisan make:migration create_cash_collections_table
php artisan make:migration create_suppliers_table
php artisan make:migration create_customers_table
php artisan make:migration create_credit_sales_table
php artisan make:migration create_chart_of_accounts_table
php artisan make:migration create_journals_table
php artisan make:migration create_journal_entries_table
php artisan make:migration create_account_balances_table
php artisan make:migration create_salary_payments_table
php artisan make:migration create_settings_table
```

### Key Migration Details

```php
// create_stations_table
Schema::create('stations', function (Blueprint $table) {
    $table->id();
    $table->string('name', 150);
    $table->text('address')->nullable();
    $table->string('phone', 20)->nullable();
    $table->string('license_number', 50)->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});

// add_station_fields_to_users_table
Schema::table('users', function (Blueprint $table) {
    $table->foreignId('station_id')->nullable()->constrained()->nullOnDelete();
    $table->string('employee_code', 20)->unique()->nullable();
    $table->string('phone', 20)->nullable();
    $table->string('cnic', 20)->unique()->nullable();
    $table->text('address')->nullable();
    $table->string('designation', 100)->nullable();
    $table->decimal('basic_salary', 12, 2)->default(0);
    $table->date('join_date')->nullable();
    $table->enum('status', ['active','inactive','terminated'])->default('active');
    $table->string('profile_photo')->nullable();
});

// create_shift_logs_table
Schema::create('shift_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('station_id')->constrained();
    $table->foreignId('shift_id')->constrained();
    $table->date('date');
    $table->dateTime('opened_at')->nullable();
    $table->dateTime('closed_at')->nullable();
    $table->foreignId('opened_by')->nullable()->constrained('users');
    $table->foreignId('closed_by')->nullable()->constrained('users');
    $table->enum('status', ['open','closed','verified'])->default('open');
    $table->decimal('total_liters_sold', 14, 4)->default(0);
    $table->decimal('total_revenue', 14, 2)->default(0);
    $table->decimal('total_cash', 14, 2)->default(0);
    $table->decimal('short_excess', 14, 2)->default(0);
    $table->text('notes')->nullable();
    $table->foreignId('journal_id')->nullable()->constrained('journals');
    $table->timestamps();
    $table->unique(['station_id', 'shift_id', 'date']);
});

// create_chart_of_accounts_table
Schema::create('chart_of_accounts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('station_id')->constrained();
    $table->string('code', 20);
    $table->string('name', 150);
    $table->enum('type', ['asset','liability','equity','revenue','expense']);
    $table->string('sub_type', 50)->nullable();
    $table->foreignId('parent_id')->nullable()->constrained('chart_of_accounts');
    $table->boolean('is_control')->default(false);
    $table->boolean('is_system')->default(false);
    $table->enum('normal_balance', ['debit','credit']);
    $table->text('description')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    $table->unique(['station_id', 'code']);
});

// create_journals_table
Schema::create('journals', function (Blueprint $table) {
    $table->id();
    $table->foreignId('station_id')->constrained();
    $table->string('journal_number', 30);
    $table->enum('type', ['general','sales','purchase','cash','bank','salary'])->default('general');
    $table->nullableMorphs('reference'); // reference_type + reference_id
    $table->date('date');
    $table->text('narration')->nullable();
    $table->boolean('is_posted')->default(false);
    $table->boolean('is_reversed')->default(false);
    $table->foreignId('reversed_by')->nullable()->constrained('journals');
    $table->decimal('total_debit', 16, 4)->default(0);
    $table->decimal('total_credit', 16, 4)->default(0);
    $table->foreignId('created_by')->constrained('users');
    $table->foreignId('posted_by')->nullable()->constrained('users');
    $table->dateTime('posted_at')->nullable();
    $table->timestamps();
    $table->unique(['station_id', 'journal_number']);
});
```

---

## 6. ELOQUENT MODELS

### Key Model Relationships

```php
// app/Models/Tank.php
class Tank extends Model
{
    public function product(): BelongsTo    { return $this->belongsTo(Product::class); }
    public function dipChart(): HasMany     { return $this->hasMany(TankDipChart::class)->orderBy('dip_mm'); }
    public function nozzles(): HasMany      { return $this->hasMany(Nozzle::class); }
    public function dipReadings(): HasMany  { return $this->hasMany(TankDipReading::class); }
    public function deliveries(): HasMany   { return $this->hasMany(TankDelivery::class); }

    public function getFillPercentageAttribute(): float {
        return $this->capacity_liters > 0
            ? round(($this->current_liters / $this->capacity_liters) * 100, 1)
            : 0;
    }
}

// app/Models/Journal.php
class Journal extends Model
{
    public function entries(): HasMany      { return $this->hasMany(JournalEntry::class); }
    public function reference(): MorphTo   { return $this->morphTo(); }
    public function createdBy(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }

    public function isBalanced(): bool {
        return round($this->total_debit, 4) === round($this->total_credit, 4);
    }
}

// app/Models/ShiftLog.php
class ShiftLog extends Model
{
    public function shift(): BelongsTo     { return $this->belongsTo(Shift::class); }
    public function sales(): HasMany       { return $this->hasMany(ShiftSale::class); }
    public function meterReadings(): HasMany { return $this->hasMany(MeterReading::class); }
    public function dipReadings(): HasMany { return $this->hasMany(TankDipReading::class); }
    public function cashCollections(): HasMany { return $this->hasMany(CashCollection::class); }
    public function journal(): BelongsTo  { return $this->belongsTo(Journal::class); }
}
```

---

## 7. INERTIA CONTROLLERS

### Pattern: Every controller returns `Inertia::render()` targeting Velzon directories

```php
// app/Http/Controllers/ShiftLogController.php
<?php
namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Shift;
use App\Models\ShiftLog;
use App\Services\ShiftOpeningService;
use App\Services\ShiftClosingService;
use App\Services\StockReconciliationService;
use Illuminate\Http\RedirectResponse;

class ShiftLogController extends Controller
{
    public function index(): Response
    {
        $shiftLogs = ShiftLog::with(['shift', 'openedBy', 'closedBy'])
            ->where('station_id', auth()->user()->station_id)
            ->orderByDesc('date')
            ->paginate(20);

        return Inertia::render('Shifts/Index', [
            'shiftLogs' => $shiftLogs,
            'shifts'    => Shift::where('station_id', auth()->user()->station_id)
                                ->where('is_active', true)->get(),
        ]);
    }

    public function show(ShiftLog $shiftLog): Response
    {
        $shiftLog->load([
            'shift', 'openedBy', 'closedBy',
            'sales.nozzle.product', 'sales.nozzle.machine',
            'dipReadings.tank.product',
            'cashCollections.user',
            'journal.entries.account',
        ]);

        return Inertia::render('Shifts/Show', [
            'shiftLog'        => $shiftLog,
            'reconciliation'  => app(StockReconciliationService::class)->reconcile($shiftLog),
        ]);
    }

    public function open(OpenShiftRequest $request): RedirectResponse
    {
        $shiftLog = app(ShiftOpeningService::class)->open($request->validated(), auth()->id());

        return redirect()->route('shifts.show', $shiftLog)
            ->with('success', 'Shift opened successfully.');
    }

    public function close(CloseShiftRequest $request, ShiftLog $shiftLog): RedirectResponse
    {
        app(ShiftClosingService::class)->closeShift($shiftLog, auth()->id());

        return redirect()->route('shifts.show', $shiftLog)
            ->with('success', 'Shift closed and journals posted.');
    }
}
```

### Share global station and session data via HandleInertiaRequests middleware

```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user()?->load('roles'),
        ],
        'station'     => $request->user()?->station,
        'flash'       => [
            'success' => $request->session()->get('success'),
            'error'   => $request->session()->get('error'),
        ],
        'permissions' => $request->user()
            ? $request->user()->getAllPermissions()->pluck('name')
            : [],
        'openShifts'  => $request->user()
            ? ShiftLog::where('station_id', $request->user()->station_id)
                ->where('status', 'open')->count()
            : 0,
    ];
}
```

---

## 8. REACT PAGE COMPONENTS (Velzon Layout + react-bootstrap)

All React page components must be designed using the Velzon page layout wrappers, `react-bootstrap` UI components, Remix Icons (`ri-*` classes), and Inertia forms.

### 8.1 Page Component Scaffolding Pattern

Adhere to the standard layout routing and structure in Velzon:

```tsx
import React from 'react';
import { Container } from 'react-bootstrap';
import { Head } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

const StandardPage = (props: any) => {
  return (
    <React.Fragment>
      <Head title="Page Title | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Page Title" pageTitle="Module Category" />
          
          {/* Main layout contents go here */}
          
        </Container>
      </div>
    </React.Fragment>
  );
};

// Hook page into Velzon layout wrapper
StandardPage.layout = (page: any) => <Layout children={page} />;
export default StandardPage;
```

### 8.2 Dashboard Page (`Dashboard/Index.tsx`)

Build this with metric cards, fuel level progress meters, and an ApexChart:

```tsx
import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { Head } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';
import ReactApexChart from 'react-apexcharts';

interface Props {
  todayRevenue: number;
  todayLiters: number;
  openShiftsCount: number;
  alertsCount: number;
  salesData: { name: string; liters: number; amount: number }[];
  tankLevels: { name: string; product: string; percentage: number; current: number; capacity: number }[];
}

const Dashboard = ({ todayRevenue, todayLiters, openShiftsCount, alertsCount, salesData, tankLevels }: Props) => {
  // Bar chart options for sales by product
  const chartOptions = {
    chart: {
      type: 'bar' as const,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '35%', borderRadius: 4 }
    },
    xaxis: {
      categories: salesData.map(item => item.name)
    },
    colors: ['#3577f1'],
    grid: { borderColor: '#f1f1f1' }
  };

  const chartSeries = [
    {
      name: 'Liters Sold',
      data: salesData.map(item => item.liters)
    }
  ];

  return (
    <React.Fragment>
      <Head title="Dashboard" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Dashboard" pageTitle="Overview" />
          
          {/* Metrics Row */}
          <Row>
            <Col xl={3} md={6}>
              <Card className="card-animate">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Today's Revenue</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-end justify-content-between mt-4">
                    <div>
                      <h4 className="fs-22 fw-semibold ff-secondary mb-4">PKR {todayRevenue.toLocaleString()}</h4>
                    </div>
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-success-subtle rounded fs-3">
                        <i className="ri-money-dollar-circle-line text-success"></i>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={3} md={6}>
              <Card className="card-animate">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Liters Sold</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-end justify-content-between mt-4">
                    <div>
                      <h4 className="fs-22 fw-semibold ff-secondary mb-4">{todayLiters.toLocaleString()} L</h4>
                    </div>
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-info-subtle rounded fs-3">
                        <i className="ri-gas-station-line text-info"></i>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={3} md={6}>
              <Card className="card-animate">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Open Shifts</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-end justify-content-between mt-4">
                    <div>
                      <h4 className="fs-22 fw-semibold ff-secondary mb-4">{openShiftsCount}</h4>
                    </div>
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-warning-subtle rounded fs-3">
                        <i className="ri-time-line text-warning"></i>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={3} md={6}>
              <Card className="card-animate">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Active Alerts</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-end justify-content-between mt-4">
                    <div>
                      <h4 className="fs-22 fw-semibold ff-secondary mb-4">{alertsCount}</h4>
                    </div>
                    <div className="avatar-sm flex-shrink-0">
                      <span className={`avatar-title ${alertsCount > 0 ? 'bg-danger-subtle text-danger' : 'bg-light text-muted'} rounded fs-3`}>
                        <i className="ri-error-warning-line"></i>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            {/* Sales Chart */}
            <Col xl={8}>
              <Card>
                <Card.Header>
                  <h5 className="card-title mb-0">Product Sales (Liters)</h5>
                </Card.Header>
                <Card.Body>
                  <ReactApexChart
                    options={chartOptions}
                    series={chartSeries}
                    type="bar"
                    height={350}
                  />
                </Card.Body>
              </Card>
            </Col>

            {/* Tank Status Levels */}
            <Col xl={4}>
              <Card>
                <Card.Header>
                  <h5 className="card-title mb-0">Fuel Tank Inventories</h5>
                </Card.Header>
                <Card.Body>
                  {tankLevels.map((tank, i) => (
                    <div key={i} className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold">{tank.name} ({tank.product})</span>
                        <span className="text-muted fs-12">{tank.current.toLocaleString()} / {tank.capacity.toLocaleString()} L ({tank.percentage}%)</span>
                      </div>
                      <div className="progress progress-sm">
                        <div
                          className={`progress-bar ${tank.percentage < 20 ? 'bg-danger' : tank.percentage < 50 ? 'bg-warning' : 'bg-success'}`}
                          role="progressbar"
                          style={{ width: `${tank.percentage}%` }}
                          aria-valuenow={tank.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

Dashboard.layout = (page: any) => <Layout children={page} />;
export default Dashboard;
```

### 8.3 Shift Closing Page (`Shifts/Close.tsx`)

This view records closing readings for nozzles, fuel dips, and cash collection:

```tsx
import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Card, Col, Container, Row, Form, Button, Table } from 'react-bootstrap';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Props {
  shiftLog: any;
  nozzles: any[];
  tanks: any[];
}

const CloseShift = ({ shiftLog, nozzles, tanks }: Props) => {
  const { data, setData, post, processing, errors } = useForm({
    meter_readings: nozzles.map(n => ({
      nozzle_id: n.id,
      nozzle_label: `${n.machine.name} - ${n.label}`,
      product_name: n.product.name,
      opening: n.last_reading || 0,
      closing: 0,
    })),
    dip_readings: tanks.map(t => ({
      tank_id: t.id,
      tank_name: t.name,
      product: t.product.name,
      dip_mm: 0,
      water_mm: 0,
    })),
    cash_amount: 0,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('shifts.close', shiftLog.id));
  };

  return (
    <React.Fragment>
      <Head title="Close Shift" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Close Shift" pageTitle="Shifts" />

          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Nozzle meter readings */}
              <Col lg={12}>
                <Card>
                  <Card.Header>
                    <h5 className="card-title mb-0">Nozzle Closing Readings</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table className="align-middle table-nowrap mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Nozzle</th>
                            <th>Product</th>
                            <th className="text-end">Opening Meter</th>
                            <th className="text-end" style={{ width: '200px' }}>Closing Meter</th>
                            <th className="text-end">Liters Sold</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.meter_readings.map((row, i) => (
                            <tr key={i}>
                              <td>{row.nozzle_label}</td>
                              <td>{row.product_name}</td>
                              <td className="text-end text-muted">{row.opening}</td>
                              <td>
                                <Form.Control
                                  type="number"
                                  step="0.0001"
                                  className="text-end"
                                  value={row.closing || ''}
                                  onChange={e => {
                                    const updated = [...data.meter_readings];
                                    updated[i].closing = parseFloat(e.target.value) || 0;
                                    setData('meter_readings', updated);
                                  }}
                                />
                              </td>
                              <td className="text-end font-monospace text-primary fw-medium">
                                {(row.closing - row.opening > 0 ? (row.closing - row.opening).toFixed(4) : '0.0000')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Tank dip chart inputs */}
              <Col lg={12}>
                <Card>
                  <Card.Header>
                    <h5 className="card-title mb-0">Physical Tank Dips (mm)</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      {data.dip_readings.map((row, i) => (
                        <Col md={4} key={i} className="mb-3">
                          <Card className="border shadow-none">
                            <Card.Body>
                              <h6 className="fw-semibold text-primary">{row.tank_name} <span className="text-muted fs-12">({row.product})</span></h6>
                              <div className="mb-2">
                                <Form.Label className="fs-12">Dip Level (mm)</Form.Label>
                                <Form.Control
                                  type="number"
                                  value={row.dip_mm || ''}
                                  onChange={e => {
                                    const updated = [...data.dip_readings];
                                    updated[i].dip_mm = parseInt(e.target.value) || 0;
                                    setData('dip_readings', updated);
                                  }}
                                />
                              </div>
                              <div>
                                <Form.Label className="fs-12">Water Dip (mm)</Form.Label>
                                <Form.Control
                                  type="number"
                                  value={row.water_mm || ''}
                                  onChange={e => {
                                    const updated = [...data.dip_readings];
                                    updated[i].water_mm = parseInt(e.target.value) || 0;
                                    setData('dip_readings', updated);
                                  }}
                                />
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              {/* Cash collection */}
              <Col lg={12}>
                <Card>
                  <Card.Header>
                    <h5 className="card-title mb-0">Cash Drawer Reconciliation</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Label>Total Cash Collected (PKR)</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={data.cash_amount || ''}
                          onChange={e => setData('cash_amount', parseFloat(e.target.value) || 0)}
                        />
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Label>Shift Logs & Notes</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter shift closing comments, issues, or differences..."
                          value={data.notes}
                          onChange={e => setData('notes', e.target.value)}
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={12} className="text-end mb-4">
                <Button type="submit" variant="success" size="lg" disabled={processing}>
                  {processing ? 'Processing...' : 'Close Shift & Post Financial Journals'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
    </React.Fragment>
  );
};

CloseShift.layout = (page: any) => <Layout children={page} />;
export default CloseShift;
```

### 8.4 Manual Journal Entry Page (`Accounting/JournalCreate.tsx`)

A dynamic financial transaction page using multiple line entries:

```tsx
import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Card, Col, Container, Row, Form, Button, Table } from 'react-bootstrap';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Account {
  id: number;
  code: string;
  name: string;
}

interface Props {
  accounts: Account[];
}

const JournalCreate = ({ accounts }: Props) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    date: new Date().toISOString().split('T')[0],
    narration: '',
    entries: [
      { account_id: 0, debit: 0, credit: 0, description: '' },
      { account_id: 0, debit: 0, credit: 0, description: '' },
    ]
  });

  const totalDebit = data.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredit = data.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;

  const handleEntryChange = (index: number, field: string, value: any) => {
    const updated = [...data.entries];
    updated[index] = {
      ...updated[index],
      [field]: value
    };

    // Auto-wipe opposite side on value entries
    if (field === 'debit' && value > 0) updated[index].credit = 0;
    if (field === 'credit' && value > 0) updated[index].debit = 0;

    setData('entries', updated);
  };

  const addRow = () => {
    setData('entries', [...data.entries, { account_id: 0, debit: 0, credit: 0, description: '' }]);
  };

  const removeRow = (index: number) => {
    if (data.entries.length > 2) {
      setData('entries', data.entries.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;
    post(route('journals.store'), {
      onSuccess: () => reset()
    });
  };

  return (
    <React.Fragment>
      <Head title="Create Journal Entry" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="New Journal Entry" pageTitle="Accounting" />

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col lg={12}>
                <Card>
                  <Card.Body>
                    <Row>
                      <Col md={4} className="mb-3">
                        <Form.Label>JV Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={data.date}
                          onChange={e => setData('date', e.target.value)}
                          required
                        />
                      </Col>
                      <Col md={8} className="mb-3">
                        <Form.Label>Narration / Description</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="General journal description"
                          value={data.narration}
                          onChange={e => setData('narration', e.target.value)}
                          required
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={12}>
                <Card>
                  <Card.Header className="d-flex align-items-center justify-content-between">
                    <h5 className="card-title mb-0">Journal Line Details</h5>
                    <Button variant="soft-primary" size="sm" onClick={addRow}>
                      <i className="ri-add-line align-bottom me-1"></i> Add Line
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table className="align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '30%' }}>Account</th>
                            <th>Description</th>
                            <th className="text-end" style={{ width: '15%' }}>Debit</th>
                            <th className="text-end" style={{ width: '15%' }}>Credit</th>
                            <th className="text-center" style={{ width: '50px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.entries.map((row, i) => (
                            <tr key={i}>
                              <td>
                                <Form.Select
                                  value={row.account_id || ''}
                                  onChange={e => handleEntryChange(i, 'account_id', parseInt(e.target.value))}
                                  required
                                >
                                  <option value="">Select Account</option>
                                  {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                      {acc.code} - {acc.name}
                                    </option>
                                  ))}
                                </Form.Select>
                              </td>
                              <td>
                                <Form.Control
                                  type="text"
                                  placeholder="Line item notes..."
                                  value={row.description}
                                  onChange={e => handleEntryChange(i, 'description', e.target.value)}
                                />
                              </td>
                              <td>
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  className="text-end"
                                  placeholder="0.00"
                                  value={row.debit || ''}
                                  onChange={e => handleEntryChange(i, 'debit', parseFloat(e.target.value) || 0)}
                                />
                              </td>
                              <td>
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  className="text-end"
                                  placeholder="0.00"
                                  value={row.credit || ''}
                                  onChange={e => handleEntryChange(i, 'credit', parseFloat(e.target.value) || 0)}
                                />
                              </td>
                              <td className="text-center">
                                <Button
                                  variant="link"
                                  className="text-danger p-0"
                                  onClick={() => removeRow(i)}
                                  disabled={data.entries.length <= 2}
                                >
                                  <i className="ri-delete-bin-line fs-15"></i>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light fw-semibold">
                          <tr>
                            <td colSpan={2} className="text-end">Summary Totals:</td>
                            <td className="text-end font-monospace text-success">{totalDebit.toFixed(2)}</td>
                            <td className="text-end font-monospace text-success">{totalCredit.toFixed(2)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>

                    {!isBalanced && (
                      <div className="alert alert-danger-subtle border-danger mt-3 mb-0" role="alert">
                        <i className="ri-error-warning-line align-middle me-2"></i>
                        The Journal Entry lines are unbalanced by <strong>{Math.abs(totalDebit - totalCredit).toFixed(2)}</strong>.
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={12} className="text-end mb-4">
                <Button type="submit" variant="primary" size="lg" disabled={!isBalanced || processing}>
                  {processing ? 'Posting JV...' : 'Post Journal Entry'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
    </React.Fragment>
  );
};

JournalCreate.layout = (page: any) => <Layout children={page} />;
export default JournalCreate;
```

---

## 9. ROUTES

```php
// routes/web.php
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/', fn() => redirect()->route('dashboard'));
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Stations
    Route::resource('stations', StationController::class);

    // Staff
    Route::resource('staff', StaffController::class);
    Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index');

    // Shifts
    Route::resource('shifts', ShiftController::class); // shift templates
    Route::prefix('shift-logs')->name('shifts.')->group(function () {
        Route::get('/',             [ShiftLogController::class, 'index'])->name('index');
        Route::get('/{shiftLog}',   [ShiftLogController::class, 'show'])->name('show');
        Route::post('/open',        [ShiftLogController::class, 'open'])->name('open');
        Route::post('/{shiftLog}/close',   [ShiftLogController::class, 'close'])->name('close');
        Route::post('/{shiftLog}/verify',  [ShiftLogController::class, 'verify'])->name('verify');
    });

    // Meter & Dip Readings
    Route::post('meter-readings',   [MeterReadingController::class, 'store'])->name('meter-readings.store');
    Route::post('dip-readings',     [DipReadingController::class, 'store'])->name('dip-readings.store');
    Route::post('cash-collections', [CashCollectionController::class, 'store'])->name('cash-collections.store');

    // Tanks
    Route::resource('tanks', TankController::class);
    Route::get('tanks/{tank}/dip-chart',    [TankController::class, 'dipChart'])->name('tanks.dip-chart');
    Route::post('tanks/{tank}/dip-chart',   [TankController::class, 'saveDipChart'])->name('tanks.dip-chart.save');
    Route::post('tanks/{tank}/deliveries',  [TankDeliveryController::class, 'store'])->name('tanks.deliveries.store');

    // Machines & Nozzles
    Route::resource('machines', MachineController::class);
    Route::resource('machines.nozzles', NozzleController::class)->shallow();

    // Products
    Route::resource('products', ProductController::class);
    Route::post('products/{product}/price', [ProductController::class, 'updatePrice'])->name('products.price');

    // Accounting
    Route::get('accounts',          [AccountController::class, 'index'])->name('accounts.index');
    Route::resource('accounts', AccountController::class)->except('index');
    Route::get('ledger',            [LedgerController::class, 'index'])->name('ledger.index');
    Route::get('ledger/{account}',  [LedgerController::class, 'show'])->name('ledger.show');
    Route::resource('journals', JournalController::class);
    Route::post('journals/{journal}/reverse', [JournalController::class, 'reverse'])->name('journals.reverse');

    // Customers & Suppliers
    Route::resource('customers', CustomerController::class);
    Route::resource('suppliers', SupplierController::class);
    Route::post('customers/{customer}/receive', [CustomerController::class, 'receivePayment'])->name('customers.payment');
    Route::post('suppliers/{supplier}/pay',     [SupplierController::class, 'makePayment'])->name('suppliers.payment');

    // Salary
    Route::get('salaries',              [SalaryController::class, 'index'])->name('salaries.index');
    Route::post('salaries/process',     [SalaryController::class, 'process'])->name('salaries.process');

    // Reports
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/shift/{shiftLog}', [ReportController::class, 'shift'])->name('shift');
        Route::get('/daily',            [ReportController::class, 'daily'])->name('daily');
        Route::get('/stock',            [ReportController::class, 'stock'])->name('stock');
        Route::get('/trial-balance',    [ReportController::class, 'trialBalance'])->name('trial-balance');
        Route::get('/profit-loss',      [ReportController::class, 'profitLoss'])->name('profit-loss');
        Route::get('/balance-sheet',    [ReportController::class, 'balanceSheet'])->name('balance-sheet');
        Route::get('/ar',               [ReportController::class, 'receivables'])->name('ar');
        Route::get('/ap',               [ReportController::class, 'payables'])->name('ap');
    });

    // Exports
    Route::get('export/shift/{shiftLog}', [ExportController::class, 'shift'])->name('export.shift');
    Route::get('export/report/{type}',    [ExportController::class, 'report'])->name('export.report');
});

// API Routes (Sanctum)
Route::prefix('api/v1')->middleware('auth:sanctum')->group(function () {
    Route::post('/login',       [Api\AuthController::class, 'login']);
    Route::get('/shifts/current', [Api\ShiftController::class, 'current']);
    Route::post('/meter-readings', [Api\MeterReadingController::class, 'store']);
    Route::post('/dip-readings',   [Api\DipReadingController::class, 'store']);
    Route::get('/products',        [Api\ProductController::class, 'index']);
    Route::get('/tanks',           [Api\TankController::class, 'index']);
    Route::get('/reports/daily',   [Api\ReportController::class, 'daily']);
});
```

---

## 10. CORE SERVICES

### AccountingService (Double-Entry Engine)

```php
<?php
// app/Services/AccountingService.php
namespace App\Services;

use App\Models\Journal;
use App\Models\JournalEntry;
use App\Models\AccountBalance;
use Illuminate\Support\Facades\DB;
use App\Exceptions\UnbalancedJournalException;

class AccountingService
{
    public function post(array $data, int $createdBy): Journal
    {
        $totalDebit  = collect($data['entries'])->sum('debit');
        $totalCredit = collect($data['entries'])->sum('credit');

        if (round($totalDebit, 4) !== round($totalCredit, 4)) {
            throw new UnbalancedJournalException($totalDebit, $totalCredit);
        }

        return DB::transaction(function () use ($data, $createdBy, $totalDebit) {
            $journal = Journal::create([
                'station_id'     => $data['station_id'],
                'journal_number' => $this->nextNumber($data['station_id'], $data['type']),
                'type'           => $data['type'],
                'date'           => $data['date'],
                'narration'      => $data['narration'],
                'reference_type' => $data['reference_type'] ?? null,
                'reference_id'   => $data['reference_id'] ?? null,
                'total_debit'    => $totalDebit,
                'total_credit'   => $totalDebit,
                'is_posted'      => true,
                'created_by'     => $createdBy,
                'posted_by'      => $createdBy,
                'posted_at'      => now(),
            ]);

            foreach ($data['entries'] as $entry) {
                JournalEntry::create([
                    'journal_id'  => $journal->id,
                    'account_id'  => $entry['account_id'],
                    'debit'       => $entry['debit'] ?? 0,
                    'credit'      => $entry['credit'] ?? 0,
                    'description' => $entry['description'] ?? null,
                ]);
                $this->updateBalance($entry['account_id'], $entry['debit'] ?? 0, $entry['credit'] ?? 0);
            }

            return $journal;
        });
    }

    public function reverse(Journal $journal, int $reversedBy): Journal
    {
        $reversalEntries = $journal->entries->map(fn($e) => [
            'account_id'  => $e->account_id,
            'debit'       => $e->credit,   // swap
            'credit'      => $e->debit,    // swap
            'description' => "Reversal: {$e->description}",
        ])->toArray();

        $reversal = $this->post([
            'station_id'  => $journal->station_id,
            'type'        => $journal->type,
            'date'        => now()->toDateString(),
            'narration'   => "Reversal of JV#{$journal->journal_number}: {$journal->narration}",
            'entries'     => $reversalEntries,
        ], $reversedBy);

        $journal->update(['is_reversed' => true, 'reversed_by' => $reversal->id]);

        return $reversal;
    }

    private function nextNumber(int $stationId, string $type): string
    {
        $prefix = match($type) {
            'sales'    => 'SJ', 'purchase' => 'PJ',
            'cash'     => 'CV', 'bank'     => 'BV',
            'salary'   => 'SA', default    => 'JV',
        };
        $year  = now()->year;
        $count = Journal::where('station_id', $stationId)
                        ->where('type', $type)
                        ->whereYear('created_at', $year)
                        ->count() + 1;
        return "{$prefix}-{$year}-" . str_pad($count, 5, '0', STR_PAD_LEFT);
    }

    private function updateBalance(int $accountId, float $debit, float $credit): void
    {
        AccountBalance::updateOrCreate(['account_id' => $accountId]);
        DB::table('account_balances')
            ->where('account_id', $accountId)
            ->update([
                'debit_total'  => DB::raw("debit_total + {$debit}"),
                'credit_total' => DB::raw("credit_total + {$credit}"),
                'balance'      => DB::raw(
                    "(SELECT CASE WHEN normal_balance = 'debit'
                      THEN debit_total + {$debit} - (credit_total + {$credit})
                      ELSE credit_total + {$credit} - (debit_total + {$debit})
                      END FROM chart_of_accounts WHERE id = {$accountId})"
                ),
                'updated_at'   => now(),
            ]);
    }
}
```

### DipChartService

```php
<?php
// app/Services/DipChartService.php
namespace App\Services;

use App\Models\Tank;

class DipChartService
{
    public function dipToLiters(Tank $tank, int $dipMm): float
    {
        $chart = $tank->dipChart; // ordered by dip_mm

        if ($chart->isEmpty()) {
            throw new \RuntimeException("No dip calibration chart found for tank: {$tank->name}");
        }

        $exact = $chart->firstWhere('dip_mm', $dipMm);
        if ($exact) return (float) $exact->liters;

        $lower = $chart->filter(fn($r) => $r->dip_mm < $dipMm)->last();
        $upper = $chart->filter(fn($r) => $r->dip_mm > $dipMm)->first();

        if (!$lower) return (float) $upper->liters;
        if (!$upper) return (float) $lower->liters;

        $ratio = ($dipMm - $lower->dip_mm) / ($upper->dip_mm - $lower->dip_mm);
        return round($lower->liters + $ratio * ($upper->liters - $lower->liters), 4);
    }
}
```

### ShiftClosingService (with automatic journal posting)

```php
<?php
// app/Services/ShiftClosingService.php
namespace App\Services;

use App\Models\ShiftLog;
use App\Models\Nozzle;
use App\Models\MeterReading;
use App\Models\ShiftSale;
use App\Models\CashCollection;
use App\Models\TankDipReading;
use Illuminate\Support\Facades\DB;

class ShiftClosingService
{
    public function __construct(
        private AccountingService $accounting,
        private DipChartService   $dipChart,
    ) {}

    public function closeShift(ShiftLog $shiftLog, int $closedBy): ShiftLog
    {
        return DB::transaction(function () use ($shiftLog, $closedBy) {

            $totalRevenue = 0;
            $totalCost    = 0;
            $journalEntries = [];

            // 1. Calculate sales per nozzle
            $nozzles = Nozzle::with(['product', 'machine'])
                ->where('station_id', $shiftLog->station_id)
                ->active()->get();

            foreach ($nozzles as $nozzle) {
                $opening = MeterReading::shiftNozzle($shiftLog->id, $nozzle->id, 'opening')->first();
                $closing = MeterReading::shiftNozzle($shiftLog->id, $nozzle->id, 'closing')->first();
                if (!$opening || !$closing) continue;

                $liters      = round($closing->reading_value - $opening->reading_value, 4);
                $price       = $nozzle->product->current_price;
                $cost        = $nozzle->product->current_cost;
                $gross       = round($liters * $price, 2);
                $costAmount  = round($liters * $cost, 2);

                ShiftSale::create([
                    'shift_log_id'    => $shiftLog->id,
                    'nozzle_id'       => $nozzle->id,
                    'product_id'      => $nozzle->product_id,
                    'opening_reading' => $opening->reading_value,
                    'closing_reading' => $closing->reading_value,
                    'liters_sold'     => $liters,
                    'sale_price'      => $price,
                    'cost_price'      => $cost,
                    'gross_amount'    => $gross,
                    'cost_amount'     => $costAmount,
                ]);

                $totalRevenue += $gross;
                $totalCost    += $costAmount;
                $product       = $nozzle->product;

                // Revenue entry (CR Revenue)
                $journalEntries[] = ['account_id' => $product->revenue_account_id, 'debit' => 0, 'credit' => $gross, 'description' => "{$product->name} - {$liters}L"];
                // COGS entry (DR COGS)
                $journalEntries[] = ['account_id' => $product->cogs_account_id, 'debit' => $costAmount, 'credit' => 0, 'description' => "COGS {$product->name}"];
                // Inventory reduction (CR Inventory)
                $journalEntries[] = ['account_id' => $product->inventory_account_id, 'debit' => 0, 'credit' => $costAmount, 'description' => "Inventory out {$product->name}"];
            }

            // 2. Cash collection
            $totalCash  = CashCollection::where('shift_log_id', $shiftLog->id)->sum('amount');
            $shortExcess = round($totalCash - $totalRevenue, 2);

            // 3. Post journals: DR Cash / CR Sales / DR COGS / CR Inventory
            array_unshift($journalEntries, [
                'account_id'  => setting('cash_account_id', $shiftLog->station_id),
                'debit'       => $totalCash,
                'credit'      => 0,
                'description' => "Cash collected - {$shiftLog->shift->name} {$shiftLog->date}",
            ]);

            $journal = $this->accounting->post([
                'station_id'     => $shiftLog->station_id,
                'type'           => 'sales',
                'date'           => $shiftLog->date,
                'narration'      => "Shift closing: {$shiftLog->shift->name} - {$shiftLog->date}",
                'reference_type' => ShiftLog::class,
                'reference_id'   => $shiftLog->id,
                'entries'        => $journalEntries,
            ], $closedBy);

            // 4. Update dip readings (liters from chart calibration)
            foreach (TankDipReading::where('shift_log_id', $shiftLog->id)->get() as $dipReading) {
                $liters = $this->dipChart->dipToLiters($dipReading->tank, $dipReading->dip_mm);
                $dipReading->update(['liters_from_chart' => $liters]);
                $dipReading->tank->update(['current_liters' => $liters]);
            }

            $shiftLog->update([
                'closed_at'          => now(),
                'closed_by'          => $closedBy,
                'status'             => 'closed',
                'total_liters_sold'  => ShiftSale::where('shift_log_id', $shiftLog->id)->sum('liters_sold'),
                'total_revenue'      => $totalRevenue,
                'total_cash'         => $totalCash,
                'short_excess'       => $shortExcess,
                'journal_id'         => $journal->id,
            ]);

            event(new ShiftClosed($shiftLog));
            return $shiftLog->fresh();
        });
    }
}
```

---

## 11. ROLES & PERMISSIONS

```php
// database/seeders/RolesAndPermissionsSeeder.php
$permissions = [
    // Stations
    'view stations', 'manage stations',
    // Staff
    'view staff', 'manage staff', 'process salary',
    // Shifts
    'view shifts', 'manage shifts', 'open shift', 'close shift', 'verify shift',
    // Readings
    'record meter readings', 'record dip readings', 'record cash collections',
    // Tanks
    'view tanks', 'manage tanks', 'record deliveries',
    // Machines
    'view machines', 'manage machines',
    // Products
    'view products', 'manage products', 'update prices',
    // Accounting
    'view accounts', 'manage accounts',
    'view journals', 'post journals', 'reverse journals',
    // Customers & Suppliers
    'manage customers', 'manage suppliers',
    'receive payments', 'make payments',
    // Reports
    'view reports', 'export reports',
];

// Roles
$roles = [
    'super_admin'      => $permissions,  // all
    'station_manager'  => array_diff($permissions, ['manage stations']),
    'accountant'       => ['view accounts','manage accounts','view journals','post journals','reverse journals','view reports','export reports','receive payments','make payments','process salary'],
    'shift_supervisor' => ['view shifts','open shift','close shift','verify shift','record meter readings','record dip readings','record cash collections','view tanks','view reports'],
    'cashier'          => ['view shifts','open shift','record meter readings','record dip readings','record cash collections'],
    'attendant'        => ['view shifts'],
];
```

---

## 12. DEFAULT CHART OF ACCOUNTS SEEDER

```php
// database/seeders/ChartOfAccountsSeeder.php
$accounts = [
    // ASSETS
    ['code'=>'1000','name'=>'Assets',               'type'=>'asset',    'normal_balance'=>'debit',  'parent'=>null],
    ['code'=>'1100','name'=>'Cash in Hand',          'type'=>'asset',    'normal_balance'=>'debit',  'parent'=>'1000', 'is_system'=>true],
    ['code'=>'1200','name'=>'Bank Account',          'type'=>'asset',    'normal_balance'=>'debit',  'parent'=>'1000', 'is_system'=>true],
    ['code'=>'1300','name'=>'Accounts Receivable',   'type'=>'asset',    'normal_balance'=>'debit',  'parent'=>'1000', 'is_control'=>true, 'is_system'=>true],
    ['code'=>'1400','name'=>'Inventory - Petrol',    'type'=>'asset',    'normal_balance'=>'debit',  'parent'=>'1000', 'is_system'=>true],
    ['code'=>'1401','name'=>'Inventory - Diesel',    'type'=>'asset',    'normal_balance'=>'debit',  'parent'=>'1000', 'is_system'=>true],
    ['code'=>'1402','name'=>'Inventory - Lubricants','type'=>'asset',    'normal_balance'=>'debit',  'parent'=>'1000'],
    ['code'=>'1500','name'=>'Prepaid Expenses',      'type'=>'asset',    'normal_balance'=>'debit',  'parent'=>'1000'],
    ['code'=>'1900','name'=>'Fixed Assets',          'type'=>'asset',    'normal_balance'=>'debit',  'parent'=>'1000'],
    // LIABILITIES
    ['code'=>'2000','name'=>'Liabilities',           'type'=>'liability','normal_balance'=>'credit', 'parent'=>null],
    ['code'=>'2100','name'=>'Accounts Payable',      'type'=>'liability','normal_balance'=>'credit', 'parent'=>'2000', 'is_control'=>true, 'is_system'=>true],
    ['code'=>'2200','name'=>'Salaries Payable',      'type'=>'liability','normal_balance'=>'credit', 'parent'=>'2000', 'is_system'=>true],
    ['code'=>'2300','name'=>'Tax Payable',            'type'=>'liability','normal_balance'=>'credit', 'parent'=>'2000'],
    // EQUITY
    ['code'=>'3000','name'=>'Equity',                'type'=>'equity',   'normal_balance'=>'credit', 'parent'=>null],
    ['code'=>'3100','name'=>'Owner Capital',         'type'=>'equity',   'normal_balance'=>'credit', 'parent'=>'3000'],
    ['code'=>'3200','name'=>'Retained Earnings',     'type'=>'equity',   'normal_balance'=>'credit', 'parent'=>'3000'],
    // REVENUE
    ['code'=>'4000','name'=>'Revenue',               'type'=>'revenue',  'normal_balance'=>'credit', 'parent'=>null],
    ['code'=>'4100','name'=>'Petrol Sales',          'type'=>'revenue',  'normal_balance'=>'credit', 'parent'=>'4000', 'is_system'=>true],
    ['code'=>'4101','name'=>'Diesel Sales',          'type'=>'revenue',  'normal_balance'=>'credit', 'parent'=>'4000', 'is_system'=>true],
    ['code'=>'4102','name'=>'Lubricant Sales',       'type'=>'revenue',  'normal_balance'=>'credit', 'parent'=>'4000'],
    ['code'=>'4900','name'=>'Other Income',          'type'=>'revenue',  'normal_balance'=>'credit', 'parent'=>'4000'],
    // EXPENSES
    ['code'=>'5000','name'=>'Expenses',              'type'=>'expense',  'normal_balance'=>'debit',  'parent'=>null],
    ['code'=>'5100','name'=>'COGS - Petrol',         'type'=>'expense',  'normal_balance'=>'debit',  'parent'=>'5000', 'is_system'=>true],
    ['code'=>'5101','name'=>'COGS - Diesel',         'type'=>'expense',  'normal_balance'=>'debit',  'parent'=>'5000', 'is_system'=>true],
    ['code'=>'5102','name'=>'COGS - Lubricants',     'type'=>'expense',  'normal_balance'=>'debit',  'parent'=>'5000'],
    ['code'=>'5200','name'=>'Salaries Expense',      'type'=>'expense',  'normal_balance'=>'debit',  'parent'=>'5000', 'is_system'=>true],
    ['code'=>'5300','name'=>'Utility Expenses',      'type'=>'expense',  'normal_balance'=>'debit',  'parent'=>'5000'],
    ['code'=>'5400','name'=>'Maintenance Expense',   'type'=>'expense',  'normal_balance'=>'debit',  'parent'=>'5000'],
    ['code'=>'5900','name'=>'Miscellaneous Expense', 'type'=>'expense',  'normal_balance'=>'debit',  'parent'=>'5000'],
];
```

---

## 13. REPORTS

```php
// app/Http/Controllers/ReportController.php
namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Models\ChartOfAccount;

class ReportController extends Controller
{
    public function trialBalance(Request $request): Response
    {
        $accounts = ChartOfAccount::with('balance')
            ->where('station_id', auth()->user()->station_id)
            ->where('is_active', true)
            ->get()
            ->map(fn($a) => [
                'code'         => $a->code,
                'name'         => $a->name,
                'type'         => $a->type,
                'debit_total'  => $a->balance?->debit_total ?? 0,
                'credit_total' => $a->balance?->credit_total ?? 0,
                'balance'      => $a->balance?->balance ?? 0,
            ]);

        return Inertia::render('Reports/TrialBalance', [
            'accounts'     => $accounts,
            'totalDebit'   => $accounts->sum('debit_total'),
            'totalCredit'  => $accounts->sum('credit_total'),
            'asOf'         => $request->get('date', today()->toDateString()),
        ]);
    }

    public function profitLoss(Request $request): Response
    {
        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to   = $request->get('to',   now()->toDateString());

        $revenue  = $this->sumAccountType('revenue', $from, $to);
        $expenses = $this->sumAccountType('expense', $from, $to);

        return Inertia::render('Reports/ProfitLoss', [
            'from'        => $from,
            'to'          => $to,
            'revenue'     => $revenue,
            'expenses'    => $expenses,
            'netProfit'   => $revenue->sum('balance') - $expenses->sum('balance'),
        ]);
    }
}
```

---

## 14. ENUMS

```php
// app/Enums/ShiftStatus.php
namespace App\Enums;

enum ShiftStatus: string {
    case Open     = 'open';
    case Closed   = 'closed';
    case Verified = 'verified';
}

// app/Enums/JournalType.php
namespace App\Enums;

enum JournalType: string {
    case General  = 'general';
    case Sales    = 'sales';
    case Purchase = 'purchase';
    case Cash     = 'cash';
    case Bank     = 'bank';
    case Salary   = 'salary';
}

// app/Enums/AccountType.php
namespace App\Enums;

enum AccountType: string {
    case Asset     = 'asset';
    case Liability = 'liability';
    case Equity    = 'equity';
    case Revenue   = 'revenue';
    case Expense   = 'expense';
}
```

---

## 15. EVENTS & LISTENERS

```php
// Events mapping to listeners in EventServiceProvider
ShiftOpened::class     → LogShiftActivity, NotifyManager
ShiftClosed::class     → PostShiftJournal (done inline), GenerateShiftPDF, UpdateTankLevels
FuelDelivered::class   → PostDeliveryJournal, UpdateTankStock
PriceChanged::class    → LogPriceHistory, BroadcastPriceUpdate
LowTankLevel::class    → AlertManager (email + in-app)
SalaryProcessed::class → PostSalaryJournal, NotifyEmployee
JournalPosted::class   → UpdateAccountBalances (done inline)
PaymentReceived::class → PostReceiptJournal, UpdateARBalance
```

---

## 16. TESTING (Pest PHP)

```php
// DipChartService Tests
it('interpolates liters correctly between calibration points')
it('returns exact liters on exact dip match')
it('throws exception when dip chart is empty')

// AccountingService Tests
it('posts a balanced journal successfully')
it('throws UnbalancedJournalException on imbalanced entries')
it('updates account balances after posting')
it('generates correct sequential journal numbers')
it('reverses a journal with swapped debits and credits')

// ShiftClosingService Tests
it('calculates liters sold from meter readings correctly')
it('calculates cash short and excess correctly')
it('posts a balanced journal on shift close')
it('updates tank current_liters from dip reading')
it('prevents closing an already closed shift')

// StockReconciliation Tests
it('detects variance between meter and dip readings')
it('includes deliveries in dip-based stock calculation')

// General Validation Tests
it('prevents duplicate shift_log for same shift and date')
it('meter closing reading must be greater than opening')
it('trial balance total debits equal total credits')
it('price change creates a price_history record')
```

---

## 17. ENVIRONMENT & BUILD

```env
APP_NAME="Petro Station Manager"
APP_ENV=local
APP_KEY=
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=petro_station
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=redis
CACHE_STORE=redis
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

```bash
# Compilation commands
npm run dev     # Starts local Vite development server
npm run build   # Compiles asset bundle for production using Vite compiler
```

---

## 18. BUILD ORDER (Recommended)

```
Phase 1 — Foundation
  ✓ Migrations (all tables)
  ✓ Eloquent Models + relationships
  ✓ Seeders (COA, roles, default station details)

Phase 2 — Core Operations
  ✓ Products CRUD
  ✓ Tanks CRUD + Dip Chart CSV parser/import
  ✓ Machines + Nozzles CRUD
  ✓ Staff Management + Role Assignment

Phase 3 — Shift Management
  ✓ Shift Templates CRUD
  ✓ ShiftLog: Open → Record Readings → Close
  ✓ DipChartService (Calibration logic)
  ✓ ShiftClosingService (Inventory update logic)
  ✓ StockReconciliationService (Validation metrics)

Phase 4 — Double-Entry Accounting
  ✓ Chart of Accounts management
  ✓ AccountingService (Journal entry logic)
  ✓ Manual Journal Entry view
  ✓ Ledger reports view
  ✓ Event listeners for auto-posting accounting journals

Phase 5 — Debtors / Creditors
  ✓ Suppliers + Tank Deliveries + Account Payables
  ✓ Customers + Credit Sales + Account Receivables
  ✓ Supplier/Customer Payments journal logging

Phase 6 — Reports & Data Export
  ✓ Shift Reports (PDF layout)
  ✓ Daily Sales metrics
  ✓ Trial Balance reports
  ✓ Profit & Loss reports
  ✓ Balance Sheet
  ✓ Data Exports (Excel / CSV sheets)

Phase 7 — Polishing
  ✓ Overviews & widgets on Dashboard
  ✓ System notifications & dip alarms
  ✓ HR Salaries Processing module
  ✓ Pest test suite validation
```
