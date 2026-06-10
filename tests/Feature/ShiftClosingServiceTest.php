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
}
