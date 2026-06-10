<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Station;
use App\Models\User;
use App\Models\Shift;
use App\Models\Product;
use App\Models\Tank;
use App\Models\Machine;
use App\Models\Nozzle;
use App\Models\ChartOfAccount;
use App\Models\Setting;
use Illuminate\Support\Facades\Hash;

class StationDemoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Station
        $station = Station::create([
            'name' => 'Main Street Station',
            'address' => '123 Main Street, Sector G-11, Islamabad',
            'phone' => '+92-51-111-222-333',
            'license_number' => 'OGRA-PET-2026-9918',
            'is_active' => true,
        ]);

        // 2. Run Chart of Accounts Seeder for this station
        $coaSeeder = new ChartOfAccountsSeeder();
        $coaSeeder->run($station->id);

        // Fetch accounts for product/setting mapping
        $cashAcc = ChartOfAccount::where('station_id', $station->id)->where('code', '110801')->first();
        $bankAcc = ChartOfAccount::where('station_id', $station->id)->where('code', '110802')->first();
        $petrolInv = ChartOfAccount::where('station_id', $station->id)->where('code', '1104010001')->first();
        $dieselInv = ChartOfAccount::where('station_id', $station->id)->where('code', '1104010002')->first();
        $lubInv = ChartOfAccount::where('station_id', $station->id)->where('code', '1104010003')->first();
        $petrolRev = ChartOfAccount::where('station_id', $station->id)->where('code', '1201010001')->first();
        $dieselRev = ChartOfAccount::where('station_id', $station->id)->where('code', '1201010002')->first();
        $lubRev = ChartOfAccount::where('station_id', $station->id)->where('code', '1201010003')->first();
        $petrolCogs = ChartOfAccount::where('station_id', $station->id)->where('code', '1301010001')->first();
        $dieselCogs = ChartOfAccount::where('station_id', $station->id)->where('code', '1301010002')->first();
        $lubCogs = ChartOfAccount::where('station_id', $station->id)->where('code', '1301010003')->first();
        $shortAcc = ChartOfAccount::where('station_id', $station->id)->where('code', '1302010004')->first();
        $excessAcc = ChartOfAccount::where('station_id', $station->id)->where('code', '120302')->first();

        // 3. Save Station Settings
        Setting::create([
            'station_id' => $station->id,
            'key' => 'cash_account_id',
            'value' => $cashAcc ? (string)$cashAcc->id : null,
        ]);
        Setting::create([
            'station_id' => $station->id,
            'key' => 'bank_account_id',
            'value' => $bankAcc ? (string)$bankAcc->id : null,
        ]);
        Setting::create([
            'station_id' => $station->id,
            'key' => 'cash_short_account_id',
            'value' => $shortAcc ? (string)$shortAcc->id : null,
        ]);
        Setting::create([
            'station_id' => $station->id,
            'key' => 'cash_excess_account_id',
            'value' => $excessAcc ? (string)$excessAcc->id : null,
        ]);

        // 4. Create Users and assign roles
        $usersData = [
            [
                'name' => 'Super Admin User',
                'email' => 'admin@petrostatedemo.com',
                'employee_code' => 'EMP-001',
                'phone' => '0300-1112221',
                'cnic' => '37405-1111111-1',
                'designation' => 'Executive Director',
                'basic_salary' => 150000,
                'role' => 'super_admin',
            ],
            [
                'name' => 'Manager John',
                'email' => 'manager@petrostatedemo.com',
                'employee_code' => 'EMP-002',
                'phone' => '0300-1112222',
                'cnic' => '37405-1111111-2',
                'designation' => 'Station Manager',
                'basic_salary' => 80000,
                'role' => 'station_manager',
            ],
            [
                'name' => 'Accountant Alice',
                'email' => 'accountant@petrostatedemo.com',
                'employee_code' => 'EMP-003',
                'phone' => '0300-1112223',
                'cnic' => '37405-1111111-3',
                'designation' => 'Senior Accountant',
                'basic_salary' => 65000,
                'role' => 'accountant',
            ],
            [
                'name' => 'Supervisor Bob',
                'email' => 'supervisor@petrostatedemo.com',
                'employee_code' => 'EMP-004',
                'phone' => '0300-1112224',
                'cnic' => '37405-1111111-4',
                'designation' => 'Shift Supervisor',
                'basic_salary' => 45000,
                'role' => 'shift_supervisor',
            ],
            [
                'name' => 'Cashier Charlie',
                'email' => 'cashier@petrostatedemo.com',
                'employee_code' => 'EMP-005',
                'phone' => '0300-1112225',
                'cnic' => '37405-1111111-5',
                'designation' => 'Head Cashier',
                'basic_salary' => 35000,
                'role' => 'cashier',
            ],
            [
                'name' => 'Attendant David',
                'email' => 'attendant@petrostatedemo.com',
                'employee_code' => 'EMP-006',
                'phone' => '0300-1112226',
                'cnic' => '37405-1111111-6',
                'designation' => 'Pump Attendant',
                'basic_salary' => 25000,
                'role' => 'attendant',
            ],
        ];

        foreach ($usersData as $ud) {
            $user = User::create([
                'station_id' => $station->id,
                'name' => $ud['name'],
                'email' => $ud['email'],
                'password' => Hash::make('password'),
                'employee_code' => $ud['employee_code'],
                'phone' => $ud['phone'],
                'cnic' => $ud['cnic'],
                'designation' => $ud['designation'],
                'basic_salary' => $ud['basic_salary'],
                'join_date' => now()->subYears(1)->toDateString(),
                'status' => 'active',
            ]);

            // Assign role
            $user->assignRole($ud['role']);
        }

        // 5. Create Shifts
        $morning = Shift::create([
            'station_id' => $station->id,
            'name' => 'Morning Shift',
            'start_time' => '06:00:00',
            'end_time' => '14:00:00',
            'is_active' => true,
        ]);
        $evening = Shift::create([
            'station_id' => $station->id,
            'name' => 'Evening Shift',
            'start_time' => '14:00:00',
            'end_time' => '22:00:00',
            'is_active' => true,
        ]);
        $night = Shift::create([
            'station_id' => $station->id,
            'name' => 'Night Shift',
            'start_time' => '22:00:00',
            'end_time' => '06:00:00',
            'is_active' => true,
        ]);

        // Assign attendant and supervisor to shifts
        $attendant = User::where('email', 'attendant@petrostatedemo.com')->first();
        $supervisor = User::where('email', 'supervisor@petrostatedemo.com')->first();
        if ($attendant) {
            $morning->users()->attach($attendant->id);
            $evening->users()->attach($attendant->id);
        }
        if ($supervisor) {
            $morning->users()->attach($supervisor->id);
        }

        // 6. Create Products
        $petrol = Product::create([
            'station_id' => $station->id,
            'name' => 'Super Petrol (PMG)',
            'code' => 'PMG',
            'unit' => 'Liters',
            'type' => 'fuel',
            'current_price' => 270.00,
            'current_cost' => 260.00,
            'revenue_account_id' => $petrolRev ? $petrolRev->id : null,
            'cogs_account_id' => $petrolCogs ? $petrolCogs->id : null,
            'inventory_account_id' => $petrolInv ? $petrolInv->id : null,
            'is_active' => true,
        ]);

        $diesel = Product::create([
            'station_id' => $station->id,
            'name' => 'High Speed Diesel (HSD)',
            'code' => 'HSD',
            'unit' => 'Liters',
            'type' => 'fuel',
            'current_price' => 280.00,
            'current_cost' => 270.00,
            'revenue_account_id' => $dieselRev ? $dieselRev->id : null,
            'cogs_account_id' => $dieselCogs ? $dieselCogs->id : null,
            'inventory_account_id' => $dieselInv ? $dieselInv->id : null,
            'is_active' => true,
        ]);

        $lub = Product::create([
            'station_id' => $station->id,
            'name' => 'Lubricant 4T Engine Oil',
            'code' => 'LUB4T',
            'unit' => 'Pieces',
            'type' => 'lubricant',
            'current_price' => 1000.00,
            'current_cost' => 800.00,
            'revenue_account_id' => $lubRev ? $lubRev->id : null,
            'cogs_account_id' => $lubCogs ? $lubCogs->id : null,
            'inventory_account_id' => $lubInv ? $lubInv->id : null,
            'is_active' => true,
        ]);

        // 7. Create Tanks
        $tankPetrol = Tank::create([
            'station_id' => $station->id,
            'product_id' => $petrol->id,
            'name' => 'PMG Tank T1',
            'capacity_liters' => 25000.00,
            'current_liters' => 15000.00,
            'low_level_alert' => 5000.00,
            'is_active' => true,
        ]);

        $tankDiesel = Tank::create([
            'station_id' => $station->id,
            'product_id' => $diesel->id,
            'name' => 'HSD Tank T2',
            'capacity_liters' => 25000.00,
            'current_liters' => 18000.00,
            'low_level_alert' => 5000.00,
            'is_active' => true,
        ]);

        // Seed some calibration chart points (dip chart)
        for ($mm = 100; $mm <= 2500; $mm += 100) {
            // linear estimate: 10 liters per mm for PMG, 10 for HSD
            $tankPetrol->dipChart()->create(['dip_mm' => $mm, 'liters' => $mm * 10.0]);
            $tankDiesel->dipChart()->create(['dip_mm' => $mm, 'liters' => $mm * 10.0]);
        }

        // 8. Create Machines & Nozzles
        $disp1 = Machine::create([
            'station_id' => $station->id,
            'name' => 'Dispenser Unit 1',
            'serial_number' => 'TK-1001',
            'brand' => 'Tokheim',
            'is_active' => true,
        ]);

        $disp2 = Machine::create([
            'station_id' => $station->id,
            'name' => 'Dispenser Unit 2',
            'serial_number' => 'TK-1002',
            'brand' => 'Tokheim',
            'is_active' => true,
        ]);

        // Nozzles
        Nozzle::create([
            'station_id' => $station->id,
            'machine_id' => $disp1->id,
            'tank_id' => $tankPetrol->id,
            'product_id' => $petrol->id,
            'label' => 'PMG-01',
            'is_active' => true,
        ]);
        Nozzle::create([
            'station_id' => $station->id,
            'machine_id' => $disp1->id,
            'tank_id' => $tankDiesel->id,
            'product_id' => $diesel->id,
            'label' => 'HSD-01',
            'is_active' => true,
        ]);

        Nozzle::create([
            'station_id' => $station->id,
            'machine_id' => $disp2->id,
            'tank_id' => $tankPetrol->id,
            'product_id' => $petrol->id,
            'label' => 'PMG-02',
            'is_active' => true,
        ]);
        Nozzle::create([
            'station_id' => $station->id,
            'machine_id' => $disp2->id,
            'tank_id' => $tankDiesel->id,
            'product_id' => $diesel->id,
            'label' => 'HSD-02',
            'is_active' => true,
        ]);
    }
}
