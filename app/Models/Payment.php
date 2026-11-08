<?php

namespace App\Models;

use App\Constants\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Manual (offline) payment record for an enrollment.
 */
class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'amount',
        'currency',
        'period',
        'status',
        'method',
        'reference',
        'note',
        'confirmed_by',
        'confirmed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'confirmed_at' => 'datetime',
    ];

    /**
     * The enrollment this payment belongs to.
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    /**
     * The admin who confirmed or rejected this payment.
     */
    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    /**
     * Whether this payment has been confirmed by an admin.
     */
    public function isConfirmed(): bool
    {
        return $this->status === PaymentStatus::CONFIRMED;
    }
}
