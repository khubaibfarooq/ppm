<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Station;
use App\Models\ChartOfAccount;
use App\Models\AccountBalance;
use App\Services\AccountingService;
use App\Exceptions\UnbalancedJournalException;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AccountingServiceTest extends TestCase
{
    use RefreshDatabase;

    private AccountingService $service;
    private Station $station;
    private ChartOfAccount $cashAccount;
    private ChartOfAccount $revenueAccount;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AccountingService();

        // Setup base station
        $this->station = Station::create([
            'name' => 'HQ Station',
            'location' => 'Lahore',
        ]);

        // Setup typical Chart of Accounts
        // 1. Cash in Hand (Asset, Normal Balance = Debit)
        $this->cashAccount = ChartOfAccount::create([
            'station_id' => $this->station->id,
            'name' => 'Cash in Hand',
            'code' => '1010',
            'type' => 'asset',
            'normal_balance' => 'debit',
        ]);

        // 2. Sales Revenue (Revenue, Normal Balance = Credit)
        $this->revenueAccount = ChartOfAccount::create([
            'station_id' => $this->station->id,
            'name' => 'Sales Revenue',
            'code' => '4010',
            'type' => 'revenue',
            'normal_balance' => 'credit',
        ]);
    }

    public function test_balanced_journal_post_succeeds_and_updates_balances(): void
    {
        $data = [
            'station_id' => $this->station->id,
            'type' => 'cash',
            'date' => now()->toDateString(),
            'narration' => 'Test Sales Posting',
            'entries' => [
                [
                    'account_id' => $this->cashAccount->id,
                    'debit' => 500.00,
                    'credit' => 0.00,
                    'description' => 'Cash received',
                ],
                [
                    'account_id' => $this->revenueAccount->id,
                    'debit' => 0.00,
                    'credit' => 500.00,
                    'description' => 'Sales recognized',
                ]
            ]
        ];

        $journal = $this->service->post($data, 1);

        $this->assertNotNull($journal);
        $this->assertEquals(500.00, $journal->total_debit);

        // Verify Account Balances
        $cashBalance = AccountBalance::where('account_id', $this->cashAccount->id)->first();
        $revenueBalance = AccountBalance::where('account_id', $this->revenueAccount->id)->first();

        // Cash (Asset, Normal Balance Debit: +500)
        $this->assertEquals(500.00, $cashBalance->debit_total);
        $this->assertEquals(0.00, $cashBalance->credit_total);
        $this->assertEquals(500.00, $cashBalance->balance);

        // Revenue (Revenue, Normal Balance Credit: +500)
        $this->assertEquals(0.00, $revenueBalance->debit_total);
        $this->assertEquals(500.00, $revenueBalance->credit_total);
        $this->assertEquals(500.00, $revenueBalance->balance);
    }

    public function test_unbalanced_journal_post_throws_exception(): void
    {
        $this->expectException(UnbalancedJournalException::class);

        $data = [
            'station_id' => $this->station->id,
            'type' => 'cash',
            'date' => now()->toDateString(),
            'narration' => 'Unbalanced Posting',
            'entries' => [
                [
                    'account_id' => $this->cashAccount->id,
                    'debit' => 500.00,
                    'credit' => 0.00,
                ],
                [
                    'account_id' => $this->revenueAccount->id,
                    'debit' => 0.00,
                    'credit' => 450.00, // missing 50
                ]
            ]
        ];

        $this->service->post($data, 1);
    }

    public function test_journal_reversal_succeeds(): void
    {
        $data = [
            'station_id' => $this->station->id,
            'type' => 'cash',
            'date' => now()->toDateString(),
            'narration' => 'Original Posting',
            'entries' => [
                [
                    'account_id' => $this->cashAccount->id,
                    'debit' => 1000.00,
                    'credit' => 0.00,
                ],
                [
                    'account_id' => $this->revenueAccount->id,
                    'debit' => 0.00,
                    'credit' => 1000.00,
                ]
            ]
        ];

        $journal = $this->service->post($data, 1);

        // Reverse it
        $reversal = $this->service->reverse($journal, 1);

        $this->assertNotNull($reversal);
        $this->assertTrue($journal->fresh()->is_reversed);

        // Check running balances - should cancel out to 0
        $cashBalance = AccountBalance::where('account_id', $this->cashAccount->id)->first();
        $revenueBalance = AccountBalance::where('account_id', $this->revenueAccount->id)->first();

        $this->assertEquals(0.00, $cashBalance->balance);
        $this->assertEquals(0.00, $revenueBalance->balance);
    }
}
