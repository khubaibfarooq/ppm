<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Journal extends Model
{
    use HasFactory;

    protected $fillable = [
        'station_id',
        'journal_number',
        'type',
        'reference_type',
        'reference_id',
        'date',
        'narration',
        'is_posted',
        'is_reversed',
        'reversed_by',
        'total_debit',
        'total_credit',
        'created_by',
        'posted_by',
        'posted_at',
    ];

    protected $casts = [
        'date' => 'date',
        'is_posted' => 'boolean',
        'is_reversed' => 'boolean',
        'total_debit' => 'double',
        'total_credit' => 'double',
        'posted_at' => 'datetime',
    ];

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function entries(): HasMany
    {
        return $this->hasMany(JournalEntry::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function postedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    public function reversedByJournal(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reversed_by');
    }

    public function isBalanced(): bool
    {
        return round($this->total_debit, 4) === round($this->total_credit, 4);
    }
}
