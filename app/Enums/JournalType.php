<?php

namespace App\Enums;

enum JournalType: string
{
    case General = 'general';
    case Sales = 'sales';
    case Purchase = 'purchase';
    case Cash = 'cash';
    case Bank = 'bank';
    case Salary = 'salary';
}
