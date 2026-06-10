<?php

namespace App\Exceptions;

use Exception;

class UnbalancedJournalException extends Exception
{
    public function __construct(float $debit, float $credit)
    {
        parent::__construct("Journal Entry is unbalanced. Total Debit: {$debit}, Total Credit: {$credit}");
    }
}
