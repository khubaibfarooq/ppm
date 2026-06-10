<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Tank;
use App\Models\Product;
use App\Models\Station;
use App\Models\TankDipChart;
use App\Services\DipChartService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DipChartServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_dip_chart_linear_interpolation(): void
    {
        // 1. Setup Station, Product, and Tank
        $station = Station::create([
            'name' => 'Test Station',
            'location' => 'Islamabad',
        ]);

        $product = Product::create([
            'station_id' => $station->id,
            'name' => 'Petrol',
            'type' => 'fuel',
            'code' => 'PET-001',
        ]);

        $tank = Tank::create([
            'station_id' => $station->id,
            'product_id' => $product->id,
            'name' => 'Tank 1',
            'capacity_liters' => 10000.00,
            'current_liters' => 0.00,
        ]);

        // 2. Set Calibration Points
        // 100mm -> 1000 Liters
        // 200mm -> 3000 Liters
        // 300mm -> 6000 Liters
        TankDipChart::create([
            'tank_id' => $tank->id,
            'dip_mm' => 100,
            'liters' => 1000.0,
        ]);

        TankDipChart::create([
            'tank_id' => $tank->id,
            'dip_mm' => 200,
            'liters' => 3000.0,
        ]);

        TankDipChart::create([
            'tank_id' => $tank->id,
            'dip_mm' => 300,
            'liters' => 6000.0,
        ]);

        $service = new DipChartService();

        // 3. Test exact hits
        $this->assertEquals(1000.0, $service->dipToLiters($tank, 100));
        $this->assertEquals(3000.0, $service->dipToLiters($tank, 200));

        // 4. Test intermediate linear interpolations
        // At 150mm: (150-100)/(200-100) = 0.5. liters = 1000 + 0.5 * (3000 - 1000) = 2000
        $this->assertEquals(2000.0, $service->dipToLiters($tank, 150));

        // At 250mm: (250-200)/(300-200) = 0.5. liters = 3000 + 0.5 * (6000 - 3000) = 4500
        $this->assertEquals(4500.0, $service->dipToLiters($tank, 250));

        // At 225mm: (225-200)/(300-200) = 0.25. liters = 3000 + 0.25 * (6000 - 3000) = 3750
        $this->assertEquals(3750.0, $service->dipToLiters($tank, 225));
    }
}
