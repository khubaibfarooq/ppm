<?php

namespace App\Services;

use App\Models\ShiftLog;
use App\Models\Nozzle;
use App\Models\MeterReading;
use App\Models\ShiftSale;
use App\Models\CashCollection;
use App\Models\TankDipReading;
use App\Events\ShiftClosed;
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
                if (!$opening || !$closing) {
                    continue;
                }

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
                if ($product->revenue_account_id) {
                    $journalEntries[] = [
                        'account_id' => $product->revenue_account_id,
                        'debit' => 0,
                        'credit' => $gross,
                        'description' => "{$product->name} Sales - {$liters}L"
                    ];
                }
                
                // COGS entry (DR COGS)
                if ($product->cogs_account_id) {
                    $journalEntries[] = [
                        'account_id' => $product->cogs_account_id,
                        'debit' => $costAmount,
                        'credit' => 0,
                        'description' => "COGS {$product->name} - {$liters}L"
                    ];
                }
                
                // Inventory reduction (CR Inventory)
                if ($product->inventory_account_id) {
                    $journalEntries[] = [
                        'account_id' => $product->inventory_account_id,
                        'debit' => 0,
                        'credit' => $costAmount,
                        'description' => "Inventory Reduction {$product->name} - {$liters}L"
                    ];
                }
            }

            // 2. Cash collection & Credit Sales
            $totalCash  = CashCollection::where('shift_log_id', $shiftLog->id)->sum('amount');
            $totalCreditSales = \App\Models\CreditSale::where('shift_log_id', $shiftLog->id)->sum('total_amount');
            $shortExcess = round(($totalCash + $totalCreditSales) - $totalRevenue, 2);

            // 3. Post journals: DR Cash / DR AR / CR Sales / DR COGS / CR Inventory / DR or CR Cash Short-Excess
            $cashAccountId = setting('cash_account_id', $shiftLog->station_id) ?? 2; // Default fallback to cash in hand
            array_unshift($journalEntries, [
                'account_id'  => $cashAccountId,
                'debit'       => $totalCash,
                'credit'      => 0,
                'description' => "Cash collected - {$shiftLog->shift->name} {$shiftLog->date->format('Y-m-d')}",
            ]);

            if ($totalCreditSales > 0) {
                $arAccount = \App\Models\ChartOfAccount::where('station_id', $shiftLog->station_id)->whereIn('code', ['110501', '1300'])->first();
                if (!$arAccount) {
                    throw new \Exception('Accounts Receivable control account is not configured.');
                }
                $journalEntries[] = [
                    'account_id'  => $arAccount->id,
                    'debit'       => $totalCreditSales,
                    'credit'      => 0,
                    'description' => "Credit Sales - {$shiftLog->shift->name} {$shiftLog->date->format('Y-m-d')}",
                ];
            }

            // Add Cash Short/Excess to balance the journal
            if (round($shortExcess, 2) != 0.00) {
                if ($shortExcess < 0) {
                    $cashShortAccountId = setting('cash_short_account_id', $shiftLog->station_id) ?? 24; // Miscellaneous Expense
                    $journalEntries[] = [
                        'account_id'  => $cashShortAccountId,
                        'debit'       => abs($shortExcess),
                        'credit'      => 0,
                        'description' => "Cash Shortage - {$shiftLog->shift->name} {$shiftLog->date->format('Y-m-d')}",
                    ];
                } else {
                    $cashExcessAccountId = setting('cash_excess_account_id', $shiftLog->station_id) ?? 19; // Other Income
                    $journalEntries[] = [
                        'account_id'  => $cashExcessAccountId,
                        'debit'       => 0,
                        'credit'      => $shortExcess,
                        'description' => "Cash Excess - {$shiftLog->shift->name} {$shiftLog->date->format('Y-m-d')}",
                    ];
                }
            }

            $journal = $this->accounting->post([
                'station_id'     => $shiftLog->station_id,
                'type'           => 'sales',
                'date'           => $shiftLog->date->format('Y-m-d'),
                'narration'      => "Shift closing: {$shiftLog->shift->name} - {$shiftLog->date->format('Y-m-d')}",
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
