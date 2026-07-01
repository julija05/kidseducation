<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveSessionAttendance extends Model
{
    public const STATUS_PRESENT = 'present';

    public const STATUS_ABSENT = 'absent';

    public const STATUS_LATE = 'late';

    public const STATUS_EXCUSED = 'excused';

    public const STATUS_CAUGHT_UP_LATER = 'caught_up_later';

    public const STATUSES = [
        self::STATUS_PRESENT,
        self::STATUS_ABSENT,
        self::STATUS_LATE,
        self::STATUS_EXCUSED,
        self::STATUS_CAUGHT_UP_LATER,
    ];

    protected $fillable = [
        'live_session_id',
        'student_id',
        'marked_by',
        'status',
        'marked_at',
    ];

    protected $casts = [
        'marked_at' => 'datetime',
    ];

    public function liveSession(): BelongsTo
    {
        return $this->belongsTo(ClassSchedule::class, 'live_session_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function markedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by');
    }
}
