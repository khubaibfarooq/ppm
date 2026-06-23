<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Station;
use App\Models\ChartOfAccount;
use App\Models\Shift;
use App\Models\ShiftLog;
use App\Models\Product;
use App\Models\Tank;
use App\Models\Machine;
use App\Models\Nozzle;
use App\Models\MeterReading;
use App\Models\CashCollection;
use App\Models\TankDipReading;
use App\Models\TankDipChart;
use App\Models\Setting;
use App\Services\AccountingService;
use App\Services\DipChartService;
use App\Services\ShiftClosingService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ShiftClosingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_shift_closing_flow_calculates_sales_and_posts_balanced_ledger(): void
    {
        // 1. Setup Station & User
        $station = Station::create([
            'name' => 'Model Town Station',
            'location' => 'Lahore',
        ]);

        $user = User::factory()->create([
            'station_id' => $station->id,
        ]);

        // 2. Setup Chart of Accounts
        $cashAcc = ChartOfAccount::create([
            'station_id' => $station->id,
            'name' => 'Cash',
            'code' => '1010',
            'type' => 'asset',
            'normal_balance' => 'debit',
        ]);

        $revAcc = ChartOfAccount::create([
            'station_id' => $station->id,
            'name' => 'Sales Revenue',
            'code' => '4010',
            'type' => 'revenue',
            'normal_balance' => 'credit',
        ]);

        $cogsAcc = ChartOfAccount::create([
            'station_id' => $station->id,
            'name' => 'COGS',
            'code' => '5010',
            'type' => 'expense',
            'normal_balance' => 'debit',
        ]);

        $invAcc = ChartOfAccount::create([
            'station_id' => $station->id,
            'name' => 'Inventory',
            'code' => '1210',
            'type' => 'asset',
            'normal_balance' => 'debit',
        ]);

        $shortAcc = ChartOfAccount::create([
            'station_id' => $station->id,
            'name' => 'Cash Shortage',
            'code' => '5090',
            'type' => 'expense',
            'normal_balance' => 'debit',
        ]);

        // 3. Configure Station Settings
        Setting::create([
            'station_id' => $station->id,
            'key' => 'cash_account_id',
            'value' => (string) $cashAcc->id,
        ]);

        Setting::create([
            'station_id' => $station->id,
            'key' => 'cash_short_account_id',
            'value' => (string) $shortAcc->id,
        ]);

        // 4. Setup Products, Tanks, Machines, Nozzles
        $product = Product::create([
            'station_id' => $station->id,
            'name' => 'Super Diesel',
            'type' => 'fuel',
            'code' => 'DSL-001',
            'current_price' => 200.00,
            'current_cost' => 150.00,
            'revenue_account_id' => $revAcc->id,
            'cogs_account_id' => $cogsAcc->id,
            'inventory_account_id' => $invAcc->id,
        ]);

        $tank = Tank::create([
            'station_id' => $station->id,
            'product_id' => $product->id,
            'name' => 'Diesel Tank Main',
            'capacity_liters' => 50000.00,
            'current_liters' => 30000.00,
        ]);

        // Dip calibration: 100mm -> 10000L, 200mm -> 20000L
        TankDipChart::create([
            'tank_id' => $tank->id,
            'dip_mm' => 100,
            'liters' => 10000.0,
        ]);
        TankDipChart::create([
            'tank_id' => $tank->id,
            'dip_mm' => 200,
            'liters' => 20000.0,
        ]);

        $machine = Machine::create([
            'station_id' => $station->id,
            'name' => 'Dispenser #1',
            'status' => 'active',
        ]);

        $nozzle = Nozzle::create([
            'station_id' => $station->id,
            'machine_id' => $machine->id,
            'tank_id' => $tank->id,
            'product_id' => $product->id,
            'label' => 'N1',
            'is_active' => true,
        ]);

        // 5. Setup Shift log
        $shift = Shift::create([
            'station_id' => $station->id,
            'name' => 'Morning Shift',
            'start_time' => '08:00:00',
            'end_time' => '16:00:00',
        ]);

        $shiftLog = ShiftLog::create([
            'station_id' => $station->id,
            'shift_id' => $shift->id,
            'date' => now()->toDateString(),
            'status' => 'open',
            'opened_at' => now(),
            'opened_by' => $user->id,
        ]);

        // 6. Record Readings & Cash Collections
        // Opening reading = 1000, Closing reading = 1100 -> Liters sold = 100.
        // Gross sales revenue = 100L * 200 = 20000. COGS = 100L * 150 = 15000.
        MeterReading::create([
            'shift_log_id' => $shiftLog->id,
            'nozzle_id' => $nozzle->id,
            'reading_type' => 'opening',
            'reading_value' => 1000.00,
            'recorded_at' => now(),
        ]);

        // Closing reading = 1100
        MeterReading::create([
            'shift_log_id' => $shiftLog->id,
            'nozzle_id' => $nozzle->id,
            'reading_type' => 'closing',
            'reading_value' => 1100.00,
            'recorded_at' => now(),
        ]);

        // Cash collection = 19800. Shortage = 20000 - 19800 = 200.
        CashCollection::create([
            'shift_log_id' => $shiftLog->id,
            'user_id' => $user->id,
            'amount' => 19800.00,
            'recorded_at' => now(),
        ]);

        // Physical dip reading = 100mm -> 10000 liters.
        TankDipReading::create([
            'shift_log_id' => $shiftLog->id,
            'tank_id' => $tank->id,
            'reading_type' => 'closing',
            'dip_mm' => 100,
            'recorded_at' => now(),
        ]);

        // 7. Run closing service
        $accountingService = new AccountingService();
        $dipChartService = new DipChartService();
        $closingService = new ShiftClosingService($accountingService, $dipChartService);

        $closedLog = $closingService->closeShift($shiftLog, $user->id);

        // 8. Assertions
        $this->assertEquals('closed', $closedLog->status);
        $this->assertEquals(100.0, $closedLog->total_liters_sold);
        $this->assertEquals(20000.00, $closedLog->total_revenue);
        $this->assertEquals(19800.00, $closedLog->total_cash);
        $this->assertEquals(-200.00, $closedLog->short_excess);

        // Check if Tank current volume is updated to 10000L
        $this->assertEquals(10000.0, $tank->fresh()->current_liters);

        // Check posted journals & entries
        $this->assertNotNull($closedLog->journal_id);
        $journal = $closedLog->journal;
        $this->assertEquals(35000.00, $journal->total_debit);

        // Verify entry breakdown:
        // Cash DR 19800
        // Shortage DR 200
        // Revenue CR 20000
        // COGS DR 15000
        // Inventory CR 15000
        $entries = $journal->entries;
        $this->assertCount(5, $entries);

        $cashEntry = $entries->firstWhere('account_id', $cashAcc->id);
        $this->assertEquals(19800.00, $cashEntry->debit);

        $shortEntry = $entries->firstWhere('account_id', $shortAcc->id);
        $this->assertEquals(200.00, $shortEntry->debit);

        $revEntry = $entries->firstWhere('account_id', $revAcc->id);
        $this->assertEquals(20000.00, $revEntry->credit);

        $cogsEntry = $entries->firstWhere('account_id', $cogsAcc->id);
        $this->assertEquals(15000.00, $cogsEntry->debit);

        $invEntry = $entries->firstWhere('account_id', $invAcc->id);
        $this->assertEquals(15000.00, $invEntry->credit);
    }

    public function test_shift_closing_via_controller_with_supplies_and_custom_readings(): void
    {
        // 1. Setup Station & User
        $station = Station::create([
            'name' => 'Model Town Station 2',
            'location' => 'Lahore',
        ]);

        $user = User::factory()->create([
            'station_id' => $station->id,
        ]);

        // Authenticate the user
        $this->actingAs($user);

        // 2. Setup Chart of Accounts
        $cashAcc = ChartOfAccount::create([
            'station_id' => $station->id,
            'name' => 'Cash',
            'code' => '1010',
            'type' => 'asset',
            'normal_balance' => 'debit',
        ]);

        $revAcc = ChartOfAccount::create([
            'station_id' => $station->id,
            'name' => 'Sales Revenue',
            'code' => '4010',
            'type' => 'revenue',
            'normal_balance' => 'credit',
        ]);

        $cogsAcc = ChartOfAccount::create([
            'station_id' => $station->id,
            'name' => 'COGS',
            'code' => '5010',
            'type' => 'expense',
            'normal_balance' => 'debit',
        ]);

        $invAcc = ChartOfAccount::create([
            'station_id' => $station->id,
            'name' => 'Inventory',
            'code' => '1210',
            'type' => 'asset',
            'normal_balance' => 'debit',
        ]);

        $shortAcc = ChartOfAccount::create([
            'station_id' => $station->id,
            'name' => 'Cash Shortage',
            'code' => '5090',
            'type' => 'expense',
            'normal_balance' => 'debit',
        ]);

        // AP account for deliveries
        $apAcc = ChartOfAccount::create([
            'station_id' => $station->id,
            'name' => 'Accounts Payable',
            'code' => '2100',
            'type' => 'liability',
            'normal_balance' => 'credit',
        ]);

        // 3. Configure Station Settings
        Setting::create([
            'station_id' => $station->id,
            'key' => 'cash_account_id',
            'value' => (string) $cashAcc->id,
        ]);

        Setting::create([
            'station_id' => $station->id,
            'key' => 'cash_short_account_id',
            'value' => (string) $shortAcc->id,
        ]);

        // 4. Setup Products, Tanks, Machines, Nozzles, Suppliers
        $product = Product::create([
            'station_id' => $station->id,
            'name' => 'Super Diesel',
            'type' => 'fuel',
            'code' => 'DSL-001',
            'current_price' => 200.00,
            'current_cost' => 150.00,
            'revenue_account_id' => $revAcc->id,
            'cogs_account_id' => $cogsAcc->id,
            'inventory_account_id' => $invAcc->id,
        ]);

        $tank = Tank::create([
            'station_id' => $station->id,
            'product_id' => $product->id,
            'name' => 'Diesel Tank Main',
            'capacity_liters' => 50000.00,
            'current_liters' => 30000.00,
        ]);

        // Dip calibration
        TankDipChart::create(['tank_id' => $tank->id, 'dip_mm' => 100, 'liters' => 10000.0]);
        TankDipChart::create(['tank_id' => $tank->id, 'dip_mm' => 200, 'liters' => 20000.0]);
        TankDipChart::create(['tank_id' => $tank->id, 'dip_mm' => 300, 'liters' => 30000.0]);

        $machine = Machine::create([
            'station_id' => $station->id,
            'name' => 'Dispenser #1',
            'status' => 'active',
        ]);

        $nozzle = Nozzle::create([
            'station_id' => $station->id,
            'machine_id' => $machine->id,
            'tank_id' => $tank->id,
            'product_id' => $product->id,
            'label' => 'N1',
            'is_active' => true,
        ]);

        $supplier = \App\Models\Supplier::create([
            'station_id' => $station->id,
            'name' => 'Shell supplier',
            'company_name' => 'Shell',
            'is_active' => true,
        ]);

        // 5. Setup Shift log
        $shift = Shift::create([
            'station_id' => $station->id,
            'name' => 'Morning Shift',
            'start_time' => '08:00:00',
            'end_time' => '16:00:00',
        ]);

        $shiftLog = ShiftLog::create([
            'station_id' => $station->id,
            'shift_id' => $shift->id,
            'date' => now()->toDateString(),
            'status' => 'open',
            'opened_at' => now(),
            'opened_by' => $user->id,
        ]);

        // We post closing details
        $response = $this->post(route('shift-logs.close', $shiftLog->id), [
            'meter_readings' => [
                [
                    'nozzle_id' => $nozzle->id,
                    'opening' => 1000.00,
                    'closing' => 1100.00,
                ]
            ],
            'dip_readings' => [
                [
                    'tank_id' => $tank->id,
                    'opening_dip' => 300,
                    'dip_mm' => 200,
                    'water_mm' => 0,
                ]
            ],
            'supplies' => [
                [
                    'tank_id' => $tank->id,
                    'supplier_id' => $supplier->id,
                    'liters_received' => 5000.00,
                    'cost_per_liter' => 140.00,
                ]
            ],
            'cash_amount' => 20000.00,
            'notes' => 'Test notes',
        ]);

        $response->assertRedirect();
        
        $shiftLog->refresh();
        $this->assertEquals('closed', $shiftLog->status);
        $this->assertEquals(100.0, $shiftLog->total_liters_sold);
        $this->assertEquals(20000.00, $shiftLog->total_revenue);
        $this->assertEquals(20000.00, $shiftLog->total_cash);
        $this->assertEquals(0.00, $shiftLog->short_excess);

        // Verify supply delivery recorded
        $delivery = \App\Models\TankDelivery::where('shift_log_id', $shiftLog->id)->first();
        $this->assertNotNull($delivery);
        $this->assertEquals(5000.00, $delivery->liters_received);
        $this->assertEquals(700000.00, $delivery->total_amount);

        // Check if supplier balance incremented
        $this->assertEquals(700000.00, $supplier->fresh()->balance);

        // Check stock reconciliation taking supply into account
        $reconciliation = app(\App\Services\StockReconciliationService::class)->reconcile($shiftLog);
        $this->assertCount(1, $reconciliation);
        $this->assertEquals(30000.0, $reconciliation[0]['opening_liters']);
        $this->assertEquals(5000.0, $reconciliation[0]['deliveries']);
        $this->assertEquals(20000.0, $reconciliation[0]['closing_liters']);
        $this->assertEquals(100.0, $reconciliation[0]['meter_sales']);
        $this->assertEquals(15000.0, $reconciliation[0]['physical_sales']);
        $this->assertEquals(14900.0, $reconciliation[0]['variance']);
    }

    public function test_shift_closing_with_customer_vehicle_credit_sales_posts_ar_ledger(): void
    {
        // 1. Setup Station & User
        $station = Station::create([
            'name' => 'Model Town Station 3',
            'location' => 'Lahore',
        ]);

        $user = User::factory()->create([
            'station_id' => $station->id,
        ]);

        $this->actingAs($user);

        // 2. Setup Chart of Accounts
        $cashAcc = ChartOfAccount::create([
            'station_id' => $station->id, 'name' => 'Cash', 'code' => '1010', 'type' => 'asset', 'normal_balance' => 'debit',
        ]);
        $revAcc = ChartOfAccount::create([
            'station_id' => $station->id, 'name' => 'Sales Revenue', 'code' => '4010', 'type' => 'revenue', 'normal_balance' => 'credit',
        ]);
        $cogsAcc = ChartOfAccount::create([
            'station_id' => $station->id, 'name' => 'COGS', 'code' => '5010', 'type' => 'expense', 'normal_balance' => 'debit',
        ]);
        $invAcc = ChartOfAccount::create([
            'station_id' => $station->id, 'name' => 'Inventory', 'code' => '1210', 'type' => 'asset', 'normal_balance' => 'debit',
        ]);
        $shortAcc = ChartOfAccount::create([
            'station_id' => $station->id, 'name' => 'Cash Shortage', 'code' => '5090', 'type' => 'expense', 'normal_balance' => 'debit',
        ]);
        $arAcc = ChartOfAccount::create([
            'station_id' => $station->id, 'name' => 'Accounts Receivable', 'code' => '110501', 'type' => 'asset', 'normal_balance' => 'debit',
        ]);

        // Configure settings
        Setting::create(['station_id' => $station->id, 'key' => 'cash_account_id', 'value' => (string) $cashAcc->id]);
        Setting::create(['station_id' => $station->id, 'key' => 'cash_short_account_id', 'value' => (string) $shortAcc->id]);

        // 3. Setup Customer, Vehicles & Products
        $customer = \App\Models\Customer::create([
            'station_id' => $station->id,
            'name' => 'Bilal Logistics',
            'is_active' => true,
            'balance' => 0.00,
        ]);

        $vehicle = \App\Models\Vehicle::create([
            'customer_id' => $customer->id,
            'vehicle_number' => 'LED-4920',
            'balance' => 0.00,
            'is_active' => true,
        ]);

        $product = Product::create([
            'station_id' => $station->id, 'name' => 'Petrol', 'type' => 'fuel', 'code' => 'PET-001',
            'current_price' => 250.00, 'current_cost' => 180.00,
            'revenue_account_id' => $revAcc->id, 'cogs_account_id' => $cogsAcc->id, 'inventory_account_id' => $invAcc->id,
        ]);

        $tank = Tank::create([
            'station_id' => $station->id, 'product_id' => $product->id, 'name' => 'Petrol Tank',
            'capacity_liters' => 50000.00, 'current_liters' => 30000.00,
        ]);

        TankDipChart::create(['tank_id' => $tank->id, 'dip_mm' => 100, 'liters' => 10000.0]);
        TankDipChart::create(['tank_id' => $tank->id, 'dip_mm' => 200, 'liters' => 20000.0]);
        TankDipChart::create(['tank_id' => $tank->id, 'dip_mm' => 300, 'liters' => 30000.0]);

        $machine = Machine::create(['station_id' => $station->id, 'name' => 'Dispenser #1', 'status' => 'active']);
        $nozzle = Nozzle::create([
            'station_id' => $station->id, 'machine_id' => $machine->id, 'tank_id' => $tank->id,
            'product_id' => $product->id, 'label' => 'N1', 'is_active' => true,
        ]);

        // 4. Setup Shift Log
        $shift = Shift::create(['station_id' => $station->id, 'name' => 'Morning', 'start_time' => '08:00:00', 'end_time' => '16:00:00']);
        $shiftLog = ShiftLog::create([
            'station_id' => $station->id, 'shift_id' => $shift->id, 'date' => now()->toDateString(),
            'status' => 'open', 'opened_at' => now(), 'opened_by' => $user->id,
        ]);

        // Closing: Nozzle sales = 100 Liters -> 100 * 250 = 25,000. COGS = 100 * 180 = 18,000.
        // Credit sale: 30 Liters * 250 = 7,500 for vehicle.
        // Cash collected: 17,200. Expected cash: 25,000 - 7,500 = 17,500. Cash shortage: 300.
        $response = $this->post(route('shift-logs.close', $shiftLog->id), [
            'meter_readings' => [
                [
                    'nozzle_id' => $nozzle->id,
                    'opening' => 1000.00,
                    'closing' => 1100.00,
                ]
            ],
            'dip_readings' => [
                [
                    'tank_id' => $tank->id,
                    'opening_dip' => 300,
                    'dip_mm' => 200,
                    'water_mm' => 0,
                ]
            ],
            'supplies' => [],
            'credit_sales' => [
                [
                    'customer_id' => $customer->id,
                    'vehicle_id' => $vehicle->id,
                    'product_id' => $product->id,
                    'liters_sold' => 30.0000,
                    'sale_price' => 250.00,
                    'total_amount' => 7500.00,
                    'vehicle_number' => 'LED-4920',
                    'slip_number' => 'SLIP-999',
                ]
            ],
            'cash_amount' => 17200.00,
            'notes' => 'Credit sale test closing',
        ]);

        $response->assertRedirect();
        $shiftLog->refresh();

        $this->assertEquals('closed', $shiftLog->status);
        $this->assertEquals(100.0, $shiftLog->total_liters_sold);
        $this->assertEquals(25000.00, $shiftLog->total_revenue);
        $this->assertEquals(17200.00, $shiftLog->total_cash);
        $this->assertEquals(-300.00, $shiftLog->short_excess);

        // Verify CreditSale record is created
        $creditSale = \App\Models\CreditSale::where('shift_log_id', $shiftLog->id)->first();
        $this->assertNotNull($creditSale);
        $this->assertEquals($customer->id, $creditSale->customer_id);
        $this->assertEquals($vehicle->id, $creditSale->vehicle_id);
        $this->assertEquals(7500.00, $creditSale->total_amount);

        // Verify balances are incremented
        $this->assertEquals(7500.00, $customer->fresh()->balance);
        $this->assertEquals(7500.00, $vehicle->fresh()->balance);

        // Verify posted journals and accounts
        $journal = $shiftLog->journal;
        $this->assertNotNull($journal);
        $this->assertEquals(43000.00, $journal->total_debit); // COGS 18000 + Cash 17200 + AR 7500 + Short 300 = 43000

        $entries = $journal->entries;
        $this->assertCount(6, $entries);

        $cashEntry = $entries->firstWhere('account_id', $cashAcc->id);
        $this->assertEquals(17200.00, $cashEntry->debit);

        $arEntry = $entries->firstWhere('account_id', $arAcc->id);
        $this->assertEquals(7500.00, $arEntry->debit);

        $shortEntry = $entries->firstWhere('account_id', $shortAcc->id);
        $this->assertEquals(300.00, $shortEntry->debit);

        $revEntry = $entries->firstWhere('account_id', $revAcc->id);
        $this->assertEquals(25000.00, $revEntry->credit);

        // Test payment application on the vehicle balance
        $paymentResponse = $this->post(route('customers.payment', $customer->id), [
            'amount' => 5000.00,
            'payment_date' => now()->toDateString(),
            'payment_method' => 'cash',
            'vehicle_id' => $vehicle->id,
            'notes' => 'Part payment',
        ]);

        $paymentResponse->assertRedirect();
        $this->assertEquals(2500.00, $customer->fresh()->balance);
        $this->assertEquals(2500.00, $vehicle->fresh()->balance);

        // Test general payment distribution
        $paymentResponse2 = $this->post(route('customers.payment', $customer->id), [
            'amount' => 2500.00,
            'payment_date' => now()->toDateString(),
            'payment_method' => 'cash',
            'notes' => 'Settling balance',
        ]);

        $paymentResponse2->assertRedirect();
        $this->assertEquals(0.00, $customer->fresh()->balance);
        $this->assertEquals(0.00, $vehicle->fresh()->balance);
    }
}
