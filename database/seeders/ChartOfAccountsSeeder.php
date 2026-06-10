<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChartOfAccount;
use App\Models\Station;

class ChartOfAccountsSeeder extends Seeder
{
    public function run(?int $stationId = null): void
    {
        $stationIds = $stationId ? [$stationId] : Station::pluck('id')->toArray();

        foreach ($stationIds as $sId) {
            $accounts = [
                // LIABILITIES, RESERVES AND SHARE CAPITAL
                ['code'=>'10',        'name'=>'Liabilities, Reserves And Share Capital', 'type'=>'liability', 'normal_balance'=>'credit', 'parent_code'=>null],
                ['code'=>'1001',      'name'=>'Share Capital',                           'type'=>'equity',    'normal_balance'=>'credit', 'parent_code'=>'10'],
                ['code'=>'100101',    'name'=>'Paid Up Capital',                         'type'=>'equity',    'normal_balance'=>'credit', 'parent_code'=>'1001'],
                ['code'=>'1001010001','name'=>"Mr. Abbas'S Capital",                     'type'=>'equity',    'normal_balance'=>'credit', 'parent_code'=>'100101'],
                ['code'=>'1002',      'name'=>'Unappropriated Profit/(Loss)',            'type'=>'equity',    'normal_balance'=>'credit', 'parent_code'=>'10'],
                ['code'=>'100201',    'name'=>'Profit And Loss',                         'type'=>'equity',    'normal_balance'=>'credit', 'parent_code'=>'1002'],
                ['code'=>'1002010001','name'=>'Year 2016',                               'type'=>'equity',    'normal_balance'=>'credit', 'parent_code'=>'100201'],
                ['code'=>'1003',      'name'=>'Long Term Loans',                         'type'=>'liability', 'normal_balance'=>'credit', 'parent_code'=>'10'],
                ['code'=>'100301',    'name'=>'Loans From Directors',                    'type'=>'liability', 'normal_balance'=>'credit', 'parent_code'=>'1003'],
                ['code'=>'1004',      'name'=>'Short Term Borrowings',                   'type'=>'liability', 'normal_balance'=>'credit', 'parent_code'=>'10'],
                ['code'=>'100401',    'name'=>'Borrowings From Banks',                   'type'=>'liability', 'normal_balance'=>'credit', 'parent_code'=>'1004'],
                ['code'=>'1005',      'name'=>'Sundry Creditors And Other Payables',     'type'=>'liability', 'normal_balance'=>'credit', 'parent_code'=>'10'],
                ['code'=>'100501',    'name'=>'Sundry Creditors',                        'type'=>'liability', 'normal_balance'=>'credit', 'parent_code'=>'1005', 'is_control'=>true, 'is_system'=>true],
                ['code'=>'100502',    'name'=>'Other Payables',                          'type'=>'liability', 'normal_balance'=>'credit', 'parent_code'=>'1005'],

                // ASSETS
                ['code'=>'11',        'name'=>'Assets',                                  'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>null],
                ['code'=>'1101',      'name'=>'Fixed Assets',                            'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'11'],
                ['code'=>'110101',    'name'=>'Tangible Fixed Assets',                   'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'1101'],
                ['code'=>'110102',    'name'=>'Intangible Fixed Assets',                 'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'1101'],
                ['code'=>'110103',    'name'=>'Capital Work In Progress',                'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'1101'],
                ['code'=>'1102',      'name'=>'Long Term Deposits',                      'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'11'],
                ['code'=>'110201',    'name'=>'Security Deposits',                       'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'1102'],
                ['code'=>'110202',    'name'=>'Bank Guarantee Margin',                   'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'1102'],
                ['code'=>'110203',    'name'=>'Letter Of Guarantee Margin',              'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'1102'],
                ['code'=>'1103',      'name'=>'Stores, Spares And Tools',                'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'11'],
                ['code'=>'1104',      'name'=>'Stock In Trade',                          'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'11'],
                ['code'=>'110401',    'name'=>'Stock In Trade-Finished Goods',           'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'1104'],
                ['code'=>'1104010001','name'=>'Inventory - Petrol',                      'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'110401', 'is_system'=>true],
                ['code'=>'1104010002','name'=>'Inventory - Diesel',                      'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'110401', 'is_system'=>true],
                ['code'=>'1104010003','name'=>'Inventory - Lubricants',                  'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'110401'],
                ['code'=>'110402',    'name'=>'Stock In Trade-Work In Process',          'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'1104'],
                ['code'=>'110403',    'name'=>'Stock In Trade-Raw Material',             'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'1104'],
                ['code'=>'1105',      'name'=>'Sundry Debtors And Other Receivables',    'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'11'],
                ['code'=>'110501',    'name'=>'Sundry Debtors',                          'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'1105', 'is_control'=>true, 'is_system'=>true],
                ['code'=>'110502',    'name'=>'Other Receivables',                       'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'1105'],
                ['code'=>'1106',      'name'=>'Advances',                                'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'11'],
                ['code'=>'110601',    'name'=>'Advances To Staff',                       'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'1106'],
                ['code'=>'1107',      'name'=>'Deposits And Prepayments',                'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'11'],
                ['code'=>'110701',    'name'=>'Trade Deposits',                          'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'1107'],
                ['code'=>'110702',    'name'=>'Prepayments',                             'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'1107'],
                ['code'=>'1108',      'name'=>'Cash And Bank Balances',                  'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'11'],
                ['code'=>'110801',    'name'=>'Cash In Hand',                            'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'1108', 'is_system'=>true],
                ['code'=>'110802',    'name'=>'Bank Balances',                           'type'=>'asset',     'normal_balance'=>'debit',  'parent_code'=>'1108', 'is_system'=>true],

                // REVENUE AND INCOMES
                ['code'=>'12',        'name'=>'Revenue And Incomes',                     'type'=>'revenue',   'normal_balance'=>'credit', 'parent_code'=>null],
                ['code'=>'1201',      'name'=>'Sales',                                   'type'=>'revenue',   'normal_balance'=>'credit', 'parent_code'=>'12'],
                ['code'=>'120101',    'name'=>'Sales-Local',                             'type'=>'revenue',   'normal_balance'=>'credit', 'parent_code'=>'1201'],
                ['code'=>'1201010001','name'=>'Petrol Sales',                            'type'=>'revenue',   'normal_balance'=>'credit', 'parent_code'=>'120101', 'is_system'=>true],
                ['code'=>'1201010002','name'=>'Diesel Sales',                            'type'=>'revenue',   'normal_balance'=>'credit', 'parent_code'=>'120101', 'is_system'=>true],
                ['code'=>'1201010003','name'=>'Lubricant Sales',                         'type'=>'revenue',   'normal_balance'=>'credit', 'parent_code'=>'120101'],
                ['code'=>'120102',    'name'=>'Sales-Export',                            'type'=>'revenue',   'normal_balance'=>'credit', 'parent_code'=>'1201'],
                ['code'=>'1202',      'name'=>'Sales Return',                            'type'=>'revenue',   'normal_balance'=>'credit', 'parent_code'=>'12'],
                ['code'=>'120201',    'name'=>'Sales Return-Local',                      'type'=>'revenue',   'normal_balance'=>'credit', 'parent_code'=>'1202'],
                ['code'=>'1203',      'name'=>'Other Incomes',                           'type'=>'revenue',   'normal_balance'=>'credit', 'parent_code'=>'12'],
                ['code'=>'120301',    'name'=>'Income Form Sale Of Scrap',               'type'=>'revenue',   'normal_balance'=>'credit', 'parent_code'=>'1203'],
                ['code'=>'120302',    'name'=>'Cash Excess Account',                     'type'=>'revenue',   'normal_balance'=>'credit', 'parent_code'=>'1203', 'is_system'=>true],

                // EXPENSES AND COST OF SALES
                ['code'=>'13',        'name'=>'Expenses And Cost Of Sales',              'type'=>'expense',   'normal_balance'=>'debit',  'parent_code'=>null],
                ['code'=>'1301',      'name'=>'Direct Expenses',                         'type'=>'expense',   'normal_balance'=>'debit',  'parent_code'=>'13'],
                ['code'=>'130101',    'name'=>'Cost Of Sales',                           'type'=>'expense',   'normal_balance'=>'debit',  'parent_code'=>'1301'],
                ['code'=>'1301010001','name'=>'COGS - Petrol',                           'type'=>'expense',   'normal_balance'=>'debit',  'parent_code'=>'130101', 'is_system'=>true],
                ['code'=>'1301010002','name'=>'COGS - Diesel',                           'type'=>'expense',   'normal_balance'=>'debit',  'parent_code'=>'130101', 'is_system'=>true],
                ['code'=>'1301010003','name'=>'COGS - Lubricants',                       'type'=>'expense',   'normal_balance'=>'debit',  'parent_code'=>'130101'],
                ['code'=>'130102',    'name'=>'Purchases',                               'type'=>'expense',   'normal_balance'=>'debit',  'parent_code'=>'1301'],
                ['code'=>'130103',    'name'=>'Purchase Return',                         'type'=>'expense',   'normal_balance'=>'debit',  'parent_code'=>'1301'],
                ['code'=>'1302',      'name'=>'Indirect Expenses',                       'type'=>'expense',   'normal_balance'=>'debit',  'parent_code'=>'13'],
                ['code'=>'130201',    'name'=>'Adminstrative And General Expenses',       'type'=>'expense',   'normal_balance'=>'debit',  'parent_code'=>'1302'],
                ['code'=>'1302010001','name'=>'Fuel Expense',                            'type'=>'expense',   'normal_balance'=>'debit',  'parent_code'=>'130201'],
                ['code'=>'1302010002','name'=>'Travelling Expense',                      'type'=>'expense',   'normal_balance'=>'debit',  'parent_code'=>'130201'],
                ['code'=>'1302010003','name'=>'Salaries Expense',                        'type'=>'expense',   'normal_balance'=>'debit',  'parent_code'=>'130201', 'is_system'=>true],
                ['code'=>'1302010004','name'=>'Cash Short Expense',                      'type'=>'expense',   'normal_balance'=>'debit',  'parent_code'=>'130201', 'is_system'=>true],
                ['code'=>'130202',    'name'=>'Selling And Distribution Expenses',       'type'=>'expense',   'normal_balance'=>'debit',  'parent_code'=>'1302'],
                ['code'=>'130203',    'name'=>'Finacial Expenses',                       'type'=>'expense',   'normal_balance'=>'debit',  'parent_code'=>'1302'],
            ];

            $inserted = [];
            foreach ($accounts as $acc) {
                $parentId = null;
                if ($acc['parent_code'] && isset($inserted[$acc['parent_code']])) {
                    $parentId = $inserted[$acc['parent_code']];
                }

                $coa = ChartOfAccount::updateOrCreate([
                    'station_id' => $sId,
                    'code' => $acc['code'],
                ], [
                    'name' => $acc['name'],
                    'type' => $acc['type'],
                    'sub_type' => $acc['type'],
                    'parent_id' => $parentId,
                    'is_control' => $acc['is_control'] ?? false,
                    'is_system' => $acc['is_system'] ?? false,
                    'normal_balance' => $acc['normal_balance'],
                    'is_active' => true,
                ]);

                $inserted[$acc['code']] = $coa->id;
            }
        }
    }
}
